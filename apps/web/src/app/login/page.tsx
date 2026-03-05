'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Stack,
  Center,
  Container,
  Alert,
  Tabs,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { loginSchema, registerSchema, resetPasswordSchema } from '@dojodash/core/schemas';
import { useAuth } from '@/hooks/useAuth';

type TabValue = 'login' | 'register' | 'reset';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('login');
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, resetPassword, loading, error, getRolePath } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const loginForm = useForm({
    initialValues: { email: '', password: '' },
    validate: zodResolver(loginSchema),
  });

  const registerForm = useForm({
    initialValues: { email: '', password: '', confirmPassword: '', displayName: '' },
    validate: zodResolver(registerSchema),
  });

  const resetForm = useForm({
    initialValues: { email: '' },
    validate: zodResolver(resetPasswordSchema),
  });

  const handleLogin = async (values: typeof loginForm.values) => {
    try {
      await signIn(values.email, values.password);
      router.push(redirect ?? getRolePath());
    } catch {
      // Error is handled by useAuth
    }
  };

  const handleRegister = async (values: typeof registerForm.values) => {
    try {
      await signUp(values.email, values.password, values.displayName);
      router.push('/app/family');
    } catch {
      // Error is handled by useAuth
    }
  };

  const handleReset = async (values: typeof resetForm.values) => {
    try {
      await resetPassword(values.email);
      setResetSent(true);
    } catch {
      // Error is handled by useAuth
    }
  };

  return (
    <Center h="100vh" bg="gray.0">
      <Container size={420}>
        <Title ta="center" mb={10}>
          Welcome to DojoDash
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb={30}>
          Kids sports club management made easy
        </Text>

        <Paper radius="md" p="xl" withBorder>
          <Tabs value={activeTab} onChange={(v) => setActiveTab(v as TabValue)}>
            <Tabs.List grow mb="md">
              <Tabs.Tab value="login">Login</Tabs.Tab>
              <Tabs.Tab value="register">Register</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="login">
              <form onSubmit={loginForm.onSubmit(handleLogin)}>
                <Stack>
                  {error && (
                    <Alert icon={<IconAlertCircle size={16} />} color="red">
                      {error}
                    </Alert>
                  )}

                  <TextInput
                    label="Email"
                    placeholder="your@email.com"
                    required
                    {...loginForm.getInputProps('email')}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    required
                    {...loginForm.getInputProps('password')}
                  />

                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    onClick={() => setActiveTab('reset')}
                  >
                    Forgot password?
                  </Anchor>

                  <Button type="submit" loading={loading} fullWidth>
                    Sign in
                  </Button>
                </Stack>
              </form>
            </Tabs.Panel>

            <Tabs.Panel value="register">
              <form onSubmit={registerForm.onSubmit(handleRegister)}>
                <Stack>
                  {error && (
                    <Alert icon={<IconAlertCircle size={16} />} color="red">
                      {error}
                    </Alert>
                  )}

                  <TextInput
                    label="Name"
                    placeholder="Your name"
                    required
                    {...registerForm.getInputProps('displayName')}
                  />

                  <TextInput
                    label="Email"
                    placeholder="your@email.com"
                    required
                    {...registerForm.getInputProps('email')}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Create a password"
                    required
                    {...registerForm.getInputProps('password')}
                  />

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    required
                    {...registerForm.getInputProps('confirmPassword')}
                  />

                  <Button type="submit" loading={loading} fullWidth>
                    Create account
                  </Button>
                </Stack>
              </form>
            </Tabs.Panel>

            <Tabs.Panel value="reset">
              {resetSent ? (
                <Stack align="center" py="md">
                  <Text ta="center">
                    Password reset email sent! Check your inbox.
                  </Text>
                  <Button variant="subtle" onClick={() => setActiveTab('login')}>
                    Back to login
                  </Button>
                </Stack>
              ) : (
                <form onSubmit={resetForm.onSubmit(handleReset)}>
                  <Stack>
                    <Text size="sm" c="dimmed">
                      Enter your email and we'll send you a reset link.
                    </Text>

                    <TextInput
                      label="Email"
                      placeholder="your@email.com"
                      required
                      {...resetForm.getInputProps('email')}
                    />

                    <Button type="submit" loading={loading} fullWidth>
                      Send reset link
                    </Button>

                    <Anchor
                      component="button"
                      type="button"
                      size="sm"
                      ta="center"
                      onClick={() => setActiveTab('login')}
                    >
                      Back to login
                    </Anchor>
                  </Stack>
                </form>
              )}
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Container>
    </Center>
  );
}
