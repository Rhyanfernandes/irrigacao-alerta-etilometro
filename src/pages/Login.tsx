
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigate, useNavigate } from "react-router-dom";
import { LoginCredentials } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data as LoginCredentials);
      navigate("/tests");
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      toast({
        title: 'Erro ao fazer login',
        description: 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // If already authenticated, redirect to tests page
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/tests" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-6">
              <Droplets className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">IrriCom Sistema</CardTitle>
            <CardDescription>
              Faça login com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-xs text-center text-gray-500 mt-4">
              © 2023 IrriCom Sistema. Todos os direitos reservados.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
