import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { KeyRound, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const demoUsers = [
  "admin@fundsweb.local",
  "sales@fundsweb.local",
  "warehouse@fundsweb.local",
  "accounts@fundsweb.local"
];

export const LoginPage = () => {
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(demoUsers[0]);
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Login failed. Check the API URL, seed data, and credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <KeyRound className="h-5 w-5" />
          </div>
          <CardTitle>Operations Portal Login</CardTitle>
          <p className="text-sm text-muted-foreground">Use any seeded role account to enter the workspace.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-1 text-sm font-medium">
              <span>Email</span>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              <span>Password</span>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "Signing in" : "Sign in"}
            </Button>
          </form>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {demoUsers.map((user) => (
              <Button key={user} variant="secondary" size="sm" onClick={() => setEmail(user)}>
                {user.split("@")[0]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

