import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <AlertTriangle className="mb-3 h-10 w-10 text-destructive/60" />
            <h3 className="text-base font-semibold text-foreground">
              {this.props.fallbackTitle ?? "Something went wrong"}
            </h3>
            {import.meta.env.DEV && this.state.error && (
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                {this.state.error.message}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={this.handleReset}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
