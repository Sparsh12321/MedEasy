import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  Thermometer, 
  Heart, 
  Activity, 
  UserCheck, 
  Sun, 
  Shield,
  Pill,
  Stethoscope,
  Droplet,
  Brain,
  Eye,
  Scissors
} from "lucide-react";
import type { Category } from "@shared/schema";

const iconMap = {
  thermometer: Thermometer,
  heart: Heart,
  activity: Activity,
  "user-check": UserCheck,
  sun: Sun,
  shield: Shield,
  pill: Pill,
  stethoscope: Stethoscope,
  droplet: Droplet,
  brain: Brain,
  eye: Eye,
  scissors: Scissors,
};

export default function CategoryGrid() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse" data-testid={`skeleton-category-${i}`}>
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" data-testid="category-grid">
        {categories?.map((category) => {
          const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Pill;
          
          return (
            <div 
              key={category.id}
              className="category-hover bg-white p-6 rounded-xl shadow-sm cursor-pointer transition-all duration-300 text-center group"
              data-testid={`card-category-${category.id}`}
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20">
                <IconComponent className="w-8 h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="font-semibold text-sm" data-testid={`text-category-name-${category.id}`}>
                {category.name}
              </h3>
            </div>
          );
        })}
      </div>
      
      <div className="text-center mt-8">
        <Button 
          className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          data-testid="button-view-all-categories"
        >
          View All Categories
        </Button>
      </div>
    </>
  );
}
