const KEY   = import.meta.env.VITE_DEFINED_API_KEY;
const CHAIN = import.meta.env.VITE_CHAIN || 'polygon';

export const fetchDefinedTokenPrice = async (): Promise<number> => {
  const addrEnv = import.meta.env.VITE_TOKEN_ADDRESS;
  if (!addrEnv) throw new Error('VITE_TOKEN_ADDRESS not defined');
  const ADDR = addrEnv.toLowerCase();
  const res = await fetch(`https://api.defined.fi/v1/token/${CHAIN}/${ADDR}`,{
    headers:{ Authorization: KEY }
  });
  if(!res.ok) throw new Error('Defined API '+res.status);
  const json = await res.json();
  const price = Number(json.priceUSD);
  if(!price) throw new Error('No price field');
  return price;
};
