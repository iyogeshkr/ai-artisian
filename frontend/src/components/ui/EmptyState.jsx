import { AlertCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ 
  icon: Icon = ShoppingBag,
  title = "Nothing here",
  description = "Try adjusting your filters or search criteria",
  action = null,
  className = ""
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-12 px-4 text-center ${className}`}>
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-6 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && action}
    </div>
  );
}

export function CartEmptyState({ onBrowse }) {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Your cart is empty"
      description="Start shopping to add items to your cart"
      action={
        <Button onClick={onBrowse} size="sm">
          Browse Marketplace
        </Button>
      }
    />
  );
}

export function ErrorState({ 
  title = "Something went wrong",
  description = "Please try again or contact support",
  action = null
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={description}
      action={action}
      className="border-red-200 bg-red-50/30"
    />
  );
}

export function LoadingState({ 
  message = "Loading...",
  size = "md"
}) {
  const sizeClasses = {
    sm: "h-8 w-8 border-2",
    md: "h-12 w-12 border-3",
    lg: "h-16 w-16 border-4"
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`animate-spin rounded-full border-primary/20 border-t-primary ${sizeClasses[size]}`} />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default EmptyState;
