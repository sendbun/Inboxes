import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserAccounts } from "@/hooks/use-user-accounts";
import { useDomains } from "@/hooks/use-domains";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { validatePassword } from "@/lib/user-account-service";
import { generateStrongPassword } from "@/lib/email-service";

export function AccountPopup({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { signup, login, switchAccount, allAccounts } = useUserAccounts();
  const [tab, setTab] = useState("login");
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // Create state
  const [createDisplayName, setCreateDisplayName] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { domains, isLoading: domainsLoading } = useDomains();

  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      setSelectedDomain(domains[0].name);
    }
  }, [domains, selectedDomain]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const result = await login(loginEmail, loginPassword);
      if (result.success) {
        toast("Logged in", { description: `Welcome back, ${loginEmail}` });
        onOpenChange(false);
      } else {
        toast("Error", { description: result.message });
      }
    } catch (error) {
      toast("Error", { description: "An unexpected error occurred" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsCreating(true);
    try {
      const validationErrors: string[] = [];
      if (!createUsername.trim()) {
        validationErrors.push("Username is required");
      }
      if (!selectedDomain) {
        validationErrors.push("Please select a domain");
      }
      const passwordValidation = validatePassword(createPassword);
      if (!passwordValidation.isValid) {
        validationErrors.push(...passwordValidation.errors);
      }
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsCreating(false);
        return;
      }
      const fullEmail = `${createUsername}@${selectedDomain}`;
      const result = await signup(fullEmail, createPassword, createDisplayName);
      if (result.success) {
        toast("Account created", { description: fullEmail });
        onOpenChange(false);
      } else {
        setErrors([result.message]);
      }
    } catch (error) {
      setErrors(["An unexpected error occurred. Please try again."]);
    } finally {
      setIsCreating(false);
    }
  };

  const generatePassword = () => {
    const newPassword = generateStrongPassword();
    setCreatePassword(newPassword);
  };

  const getFullEmail = () => {
    if (createUsername && selectedDomain) {
      return `${createUsername}@${selectedDomain}`;
    }
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full flex mb-4">
            <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
            <TabsTrigger value="create" className="flex-1">Create Account</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
              <Input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={isLoggingIn}>{isLoggingIn ? "Logging in..." : "Login"}</Button>
            </form>
          </TabsContent>
          <TabsContent value="create">
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                type="text"
                placeholder="Display Name (optional)"
                value={createDisplayName}
                onChange={e => setCreateDisplayName(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={createUsername}
                  onChange={e => setCreateUsername(e.target.value)}
                  className="flex-1"
                  required
                />
                <span className="text-gray-500">@</span>
                <Select value={selectedDomain} onValueChange={setSelectedDomain} disabled={domainsLoading}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={domainsLoading ? "Loading..." : "Select domain"} />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.name}>
                        {domain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {getFullEmail() && (
                <div className="text-sm text-gray-600">
                  Full email: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{getFullEmail()}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 relative">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={createPassword}
                    onChange={e => setCreatePassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePassword}
                  className="whitespace-nowrap"
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, and number
              </p>
              <Button type="submit" className="w-full" disabled={isCreating || !selectedDomain}>
                {isCreating ? "Creating..." : "Create Account"}
              </Button>
              {errors.length > 0 && (
                <div className="mt-2 text-red-600 text-sm">
                  <ul className="list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 