import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "@/pages/LoginPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoginPage />
      <Toaster />
    </QueryClientProvider>
  );
}
