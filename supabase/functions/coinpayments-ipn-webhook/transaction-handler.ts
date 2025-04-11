
import { createDbClient } from "./db-client.ts";

// Process CoinPayments IPN payload and update transaction status
export async function processIpnPayload(payload: Record<string, string>, logEntryId?: string) {
  try {
    console.log(`Processing IPN payload for transaction ${payload.txn_id}, ipn_type: ${payload.ipn_type}`);
    
    // Create Supabase client
    const supabase = createDbClient();
    
    // Update the log entry with payload details if available
    if (logEntryId) {
      try {
        const { error: logUpdateError } = await supabase
          .from('ipn_logs')
          .update({
            txn_id: payload.txn_id,
            status: payload.status || null,
            processing_status: 'processing',
            details: JSON.stringify({
              payload: payload,
              processing_step: 'initial_payload_analysis',
              timestamp: new Date().toISOString()
            })
          })
          .eq('id', logEntryId);
          
        if (logUpdateError) {
          console.error(`Error updating log entry ${logEntryId}:`, logUpdateError);
        }
      } catch (logError) {
        console.error(`Exception updating log entry ${logEntryId}:`, logError);
      }
    }
    
    // Only process API type IPN messages for now
    if (payload.ipn_type !== 'api') {
      console.log(`Skipping non-API IPN type: ${payload.ipn_type}`);
      
      // Update log entry
      if (logEntryId) {
        try {
          await supabase
            .from('ipn_logs')
            .update({
              processing_status: 'skipped',
              details: JSON.stringify({
                reason: `Non-API IPN type: ${payload.ipn_type}`,
                payload: payload,
                timestamp: new Date().toISOString()
              })
            })
            .eq('id', logEntryId);
        } catch (error) {
          console.error(`Error updating log entry for non-API IPN:`, error);
        }
      }
      
      return { 
        success: true, 
        message: `IPN type ${payload.ipn_type} logged but not processed`, 
        skipped: true 
      };
    }
    
    // Find transaction by external transaction ID
    console.log(`Looking for transaction with external_transaction_id: ${payload.txn_id}`);
    
    try {
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('external_transaction_id', payload.txn_id)
        .maybeSingle();
        
      if (txError) {
        console.error(`Error fetching transaction: ${txError.message}`, txError);
        
        // Update log with detailed error
        if (logEntryId) {
          await supabase
            .from('ipn_logs')
            .update({
              processing_status: 'error',
              error_message: `Database error: ${txError.message}`,
              error_category: 'database_query_error',
              details: JSON.stringify({
                error: txError,
                query: {
                  table: 'transactions',
                  action: 'select',
                  filter: {
                    external_transaction_id: payload.txn_id
                  }
                },
                timestamp: new Date().toISOString()
              }),
              processed_at: new Date().toISOString()
            })
            .eq('id', logEntryId);
        }
        
        return { 
          success: false, 
          message: `Database error: ${txError.message}`,
          error: txError.message,
          error_category: 'database_query_error'
        };
      }
      
      // If no transaction found, try backup lookup methods
      if (!transaction) {
        console.warn(`No transaction found with external_transaction_id: ${payload.txn_id}`);
        
        // Try looking up by payment_address if available
        if (payload.address) {
          console.log(`Trying to find transaction by payment_address: ${payload.address}`);
          
          try {
            const { data: addrTransaction, error: addrError } = await supabase
              .from('transactions')
              .select('*')
              .eq('payment_address', payload.address)
              .maybeSingle();
              
            if (addrError) {
              console.error(`Error looking up transaction by payment_address:`, addrError);
              
              // Log the error
              if (logEntryId) {
                await supabase
                  .from('ipn_logs')
                  .update({
                    processing_status: 'error',
                    error_message: `Payment address lookup failed: ${addrError.message}`,
                    error_category: 'database_query_error',
                    details: JSON.stringify({
                      error: addrError,
                      lookup_method: 'payment_address',
                      address: payload.address,
                      timestamp: new Date().toISOString()
                    })
                  })
                  .eq('id', logEntryId);
              }
              
              return {
                success: false,
                message: `Error looking up by payment address: ${addrError.message}`,
                error_category: 'database_query_error'
              };
            }
            
            if (!addrTransaction) {
              // Neither lookup method found a transaction
              console.error(`No transaction found by external_transaction_id or payment_address`);
              
              if (logEntryId) {
                await supabase
                  .from('ipn_logs')
                  .update({
                    processing_status: 'error',
                    error_message: `Transaction not found`,
                    error_category: 'transaction_not_found',
                    details: JSON.stringify({
                      lookup_attempts: [
                        { method: 'external_transaction_id', value: payload.txn_id },
                        { method: 'payment_address', value: payload.address }
                      ],
                      timestamp: new Date().toISOString()
                    }),
                    processed_at: new Date().toISOString()
                  })
                  .eq('id', logEntryId);
              }
              
              return { 
                success: false, 
                message: `Transaction not found for txn_id: ${payload.txn_id} or address: ${payload.address}`, 
                error_category: 'transaction_not_found'
              };
            }
            
            console.log(`Found transaction by payment_address: ${addrTransaction.id}`);
            
            // Update with external_transaction_id since we now know it
            try {
              const { error: updateError } = await supabase
                .from('transactions')
                .update({
                  external_transaction_id: payload.txn_id,
                  updated_at: new Date().toISOString()
                })
                .eq('id', addrTransaction.id);
                
              if (updateError) {
                console.error(`Error updating transaction with external ID: ${updateError.message}`);
                
                // Log the error
                if (logEntryId) {
                  await supabase
                    .from('ipn_logs')
                    .update({
                      processing_status: 'error',
                      error_message: `Failed to update external transaction ID: ${updateError.message}`,
                      error_category: 'database_update_error',
                      details: JSON.stringify({
                        error: updateError,
                        transaction_id: addrTransaction.id,
                        operation: 'update_external_id',
                        timestamp: new Date().toISOString()
                      })
                    })
                    .eq('id', logEntryId);
                }
              } else {
                console.log(`Updated transaction ${addrTransaction.id} with external_transaction_id: ${payload.txn_id}`);
                
                // Log the successful update
                if (logEntryId) {
                  await supabase
                    .from('ipn_logs')
                    .update({
                      details: JSON.stringify({
                        transaction_id: addrTransaction.id,
                        operation: 'update_external_id',
                        success: true,
                        timestamp: new Date().toISOString()
                      })
                    })
                    .eq('id', logEntryId);
                }
              }
            } catch (updateError) {
              console.error(`Exception updating transaction with external ID:`, updateError);
            }
            
            // Continue processing with the found transaction
            return await updateTransactionStatus(
              supabase, 
              addrTransaction, 
              payload, 
              logEntryId
            );
          } catch (lookupError) {
            console.error(`Exception during payment_address lookup:`, lookupError);
            
            // Log the error
            if (logEntryId) {
              await supabase
                .from('ipn_logs')
                .update({
                  processing_status: 'error',
                  error_message: `Payment address lookup exception: ${lookupError.message}`,
                  error_category: 'unexpected_error',
                  details: JSON.stringify({
                    error: lookupError.toString(),
                    stack: lookupError.stack,
                    timestamp: new Date().toISOString()
                  })
                })
                .eq('id', logEntryId);
            }
            
            return {
              success: false,
              message: `Exception during payment address lookup: ${lookupError.message}`,
              error_category: 'unexpected_error'
            };
          }
        }
        
        // Transaction not found and no payment_address to try
        console.error(`Transaction not found for txn_id: ${payload.txn_id} and no payment_address available`);
        
        if (logEntryId) {
          await supabase
            .from('ipn_logs')
            .update({
              processing_status: 'error',
              error_message: `No transaction found with external_transaction_id: ${payload.txn_id}`,
              error_category: 'transaction_not_found',
              details: JSON.stringify({
                txn_id: payload.txn_id,
                timestamp: new Date().toISOString()
              }),
              processed_at: new Date().toISOString()
            })
            .eq('id', logEntryId);
        }
        
        return { 
          success: false, 
          message: `Transaction not found for txn_id: ${payload.txn_id}`,
          error_category: 'transaction_not_found'
        };
      }
      
      // Process the found transaction
      return await updateTransactionStatus(supabase, transaction, payload, logEntryId);
    } catch (queryError) {
      console.error(`Exception querying transaction: ${queryError.message}`);
      
      // Update log with detailed error
      if (logEntryId) {
        await supabase
          .from('ipn_logs')
          .update({
            processing_status: 'error',
            error_message: `Exception querying transaction: ${queryError.message}`,
            error_category: 'unexpected_error',
            details: JSON.stringify({
              error: queryError.toString(),
              stack: queryError.stack,
              timestamp: new Date().toISOString()
            }),
            processed_at: new Date().toISOString()
          })
          .eq('id', logEntryId);
      }
      
      return { 
        success: false, 
        message: `Exception: ${queryError.message}`,
        error_category: 'unexpected_error'
      };
    }
    
  } catch (error) {
    console.error(`Error processing IPN payload: ${error.message}`);
    
    // Try to update the log entry if we have an ID
    if (logEntryId) {
      try {
        const supabase = createDbClient();
        await supabase
          .from('ipn_logs')
          .update({
            processing_status: 'error',
            error_message: `Unhandled exception: ${error.message}`,
            error_category: 'unhandled_exception',
            details: JSON.stringify({
              error: error.toString(),
              stack: error.stack,
              timestamp: new Date().toISOString()
            }),
            processed_at: new Date().toISOString()
          })
          .eq('id', logEntryId);
      } catch (logError) {
        console.error(`Failed to update log entry with error: ${logError.message}`);
      }
    }
    
    return { 
      success: false, 
      message: `Exception: ${error.message}`,
      error_category: 'unhandled_exception'
    };
  }
}

async function updateTransactionStatus(
  supabase: any, 
  transaction: any, 
  payload: Record<string, string>,
  logEntryId?: string
) {
  try {
    console.log(`Updating transaction ${transaction.id} with status from IPN`);
    
    // Log the current transaction state
    if (logEntryId) {
      await supabase
        .from('ipn_logs')
        .update({
          details: JSON.stringify({
            transaction: {
              id: transaction.id,
              current_status: transaction.status,
              user_id: transaction.user_id,
              amount: transaction.amount
            },
            processing_step: 'update_transaction_status',
            timestamp: new Date().toISOString()
          })
        })
        .eq('id', logEntryId);
    }
    
    // Map CoinPayments status to our status format
    const statusCode = parseInt(payload.status, 10) || -1;
    let newStatus = 'pending';
    
    // Complete status mapping
    if (statusCode < 0) {
      newStatus = 'failed';
    } else if (statusCode === 0) {
      newStatus = 'pending';
    } else if (statusCode >= 100) {
      newStatus = 'completed';
    } else if (statusCode >= 1) {
      newStatus = 'confirmed'; // Partial confirmation
    }
    
    console.log(`Mapped CoinPayments status ${statusCode} to: ${newStatus}`);
    
    // Log the status mapping
    if (logEntryId) {
      await supabase
        .from('ipn_logs')
        .update({
          details: JSON.stringify({
            status_mapping: {
              coinpayments_status: statusCode,
              mapped_status: newStatus,
              external_status_text: payload.status_text || null
            },
            timestamp: new Date().toISOString()
          })
        })
        .eq('id', logEntryId);
    }
    
    // If status is the same, no need to update
    if (transaction.status === newStatus) {
      console.log(`Transaction ${transaction.id} already has status ${newStatus}, no update needed`);
      
      // Still update the log entry
      if (logEntryId) {
        await supabase
          .from('ipn_logs')
          .update({
            processing_status: 'success',
            processed_at: new Date().toISOString(),
            details: JSON.stringify({
              transaction_id: transaction.id,
              status: newStatus,
              external_status: statusCode,
              no_change: true,
              timestamp: new Date().toISOString()
            })
          })
          .eq('id', logEntryId);
      }
      
      return { 
        success: true, 
        message: `Transaction ${transaction.id} already has status ${newStatus}, no update needed`,
        transaction_id: transaction.id,
        status: newStatus,
        external_status: statusCode,
        updated: false
      };
    }
    
    // Prepare update data
    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // Set completed_at timestamp if status is completed or confirmed
    if (newStatus === 'completed' || newStatus === 'confirmed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    console.log(`Updating transaction ${transaction.id} from ${transaction.status} to ${newStatus} - SQL payload:`, updateData);
    
    // Log the update attempt
    if (logEntryId) {
      await supabase
        .from('ipn_logs')
        .update({
          details: JSON.stringify({
            update_attempt: {
              transaction_id: transaction.id,
              old_status: transaction.status,
              new_status: newStatus,
              update_data: updateData
            },
            timestamp: new Date().toISOString()
          })
        })
        .eq('id', logEntryId);
    }
    
    // Update transaction status
    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transaction.id);
        
      if (updateError) {
        console.error(`Error updating transaction: ${updateError.message}`, updateError);
        
        // Categorize the error
        let errorCategory = 'database_update_error';
        if (updateError.message.includes('violates foreign key constraint')) {
          errorCategory = 'foreign_key_violation';
        } else if (updateError.message.includes('violates check constraint')) {
          errorCategory = 'check_constraint_violation';
        } else if (updateError.message.includes('violates not-null constraint')) {
          errorCategory = 'not_null_violation';
        } else if (updateError.message.includes('permission denied')) {
          errorCategory = 'permission_error';
        }
        
        // Update log with error
        if (logEntryId) {
          await supabase
            .from('ipn_logs')
            .update({
              processing_status: 'error',
              error_message: `Update error: ${updateError.message}`,
              error_category: errorCategory,
              details: JSON.stringify({
                error: updateError,
                transaction_id: transaction.id,
                update_data: updateData,
                timestamp: new Date().toISOString()
              }),
              processed_at: new Date().toISOString()
            })
            .eq('id', logEntryId);
        }
        
        return { 
          success: false, 
          message: `Error updating transaction: ${updateError.message}`,
          error: updateError.message,
          error_category: errorCategory,
          transaction_id: transaction.id
        };
      }
    } catch (error) {
      console.error(`Exception updating transaction: ${error.message}`, error);
      
      // Update log with error
      if (logEntryId) {
        await supabase
          .from('ipn_logs')
          .update({
            processing_status: 'error',
            error_message: `Exception updating transaction: ${error.message}`,
            error_category: 'unexpected_error',
            details: JSON.stringify({
              error: error.toString(),
              stack: error.stack,
              transaction_id: transaction.id,
              update_data: updateData,
              timestamp: new Date().toISOString()
            }),
            processed_at: new Date().toISOString()
          })
          .eq('id', logEntryId);
      }
      
      return {
        success: false,
        message: `Exception updating transaction: ${error.message}`,
        error_category: 'unexpected_error',
        transaction_id: transaction.id
      };
    }
    
    console.log(`Successfully updated transaction ${transaction.id} status from ${transaction.status} to ${newStatus}`);
    
    // Add a notification for the user
    try {
      console.log(`Creating notification for user ${transaction.user_id} about status change to ${newStatus}`);
      
      const notificationData = {
        user_id: transaction.user_id,
        type: 'payment_' + newStatus,
        title: `Payment ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: `Your cryptocurrency payment of $${transaction.amount} has been ${newStatus}. ${newStatus === 'completed' ? 'Tokens will be sent to your wallet shortly.' : ''}`
      };
      
      // Log the notification creation attempt
      if (logEntryId) {
        await supabase
          .from('ipn_logs')
          .update({
            details: JSON.stringify({
              notification_attempt: {
                user_id: transaction.user_id,
                notification_type: 'payment_' + newStatus,
                transaction_id: transaction.id
              },
              timestamp: new Date().toISOString()
            })
          })
          .eq('id', logEntryId);
      }
      
      const { data: notification, error: notifError } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
        
      if (notifError) {
        console.warn(`Error creating notification: ${notifError.message}`, notifError);
        
        // Log the notification error
        if (logEntryId) {
          await supabase
            .from('ipn_logs')
            .update({
              details: JSON.stringify({
                notification_error: {
                  error: notifError.message,
                  notification_data: notificationData
                },
                timestamp: new Date().toISOString()
              })
            })
            .eq('id', logEntryId);
        }
      } else {
        console.log(`Created notification ID ${notification?.id} for user ${transaction.user_id}`);
        
        // Log the successful notification creation
        if (logEntryId) {
          await supabase
            .from('ipn_logs')
            .update({
              details: JSON.stringify({
                notification_success: {
                  notification_id: notification?.id,
                  user_id: transaction.user_id,
                  notification_type: 'payment_' + newStatus
                },
                timestamp: new Date().toISOString()
              })
            })
            .eq('id', logEntryId);
        }
      }
    } catch (notifError) {
      console.error(`Exception creating notification: ${notifError.message}`, notifError);
      
      // Log the notification exception
      if (logEntryId) {
        await supabase
          .from('ipn_logs')
          .update({
            details: JSON.stringify({
              notification_exception: {
                error: notifError.toString(),
                stack: notifError.stack,
                user_id: transaction.user_id
              },
              timestamp: new Date().toISOString()
            })
          })
          .eq('id', logEntryId);
      }
    }
    
    // Update log entry with success
    if (logEntryId) {
      await supabase
        .from('ipn_logs')
        .update({
          processing_status: 'success',
          processed_at: new Date().toISOString(),
          details: JSON.stringify({
            transaction_id: transaction.id,
            old_status: transaction.status,
            new_status: newStatus,
            external_status: statusCode,
            timestamp: new Date().toISOString()
          })
        })
        .eq('id', logEntryId);
    }
    
    return { 
      success: true, 
      message: `Transaction ${transaction.id} status updated from ${transaction.status} to ${newStatus}`,
      transaction_id: transaction.id,
      old_status: transaction.status,
      new_status: newStatus,
      external_status: statusCode,
      updated: true
    };
  } catch (error) {
    console.error(`Error in updateTransactionStatus: ${error.message}`, error);
    
    // Update log with error
    if (logEntryId) {
      try {
        await supabase
          .from('ipn_logs')
          .update({
            processing_status: 'error',
            error_message: `Exception in updateTransactionStatus: ${error.message}`,
            error_category: 'unhandled_exception',
            details: JSON.stringify({
              error: error.toString(),
              stack: error.stack,
              transaction_id: transaction.id,
              timestamp: new Date().toISOString()
            }),
            processed_at: new Date().toISOString()
          })
          .eq('id', logEntryId);
      } catch (logError) {
        console.error(`Failed to update log with error: ${logError.message}`);
      }
    }
    
    return { 
      success: false, 
      message: `Exception in updateTransactionStatus: ${error.message}`,
      error_category: 'unhandled_exception',
      transaction_id: transaction.id
    };
  }
}
