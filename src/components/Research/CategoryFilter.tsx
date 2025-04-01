
import React from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            className="w-full justify-start"
            onClick={() => onCategorySelect(null)}
          >
            <Bookmark className="mr-2 h-4 w-4" />
            All Categories
          </Button>
          
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => onCategorySelect(category)}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              {category}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilter;
