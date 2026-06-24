import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { checkActive, rejoin, setUsername } from '@/lib/api';
import { useSession } from '@/lib/session';

type Status = 'idle' | 'working' | 'needsCreate';

export function LoginScreen() {
  const theme = useTheme();
  const { signIn } = useSession();

  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();
  const busy = status === 'working';

  // Step 1: check whether the username exists on the server.
  async function handleContinue() {
    if (!trimmed || busy) return;
    setError(null);
    setStatus('working');
    try {
      const res = await checkActive(trimmed);
      if (res.exists) {
        // Existing account — reactivate it if it had gone inactive, then sign in.
        if (!res.active) {
          await rejoin(trimmed);
        }
        signIn(trimmed);
        return;
      }
      // No such account yet — offer to create it.
      setStatus('needsCreate');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setStatus('idle');
    }
  }

  // Step 2 (only when the name was not found): create the account.
  async function handleCreate() {
    if (!trimmed || busy) return;
    setError(null);
    setStatus('working');
    try {
      const res = await setUsername(trimmed);
      if (res.success) {
        signIn(trimmed);
        return;
      }
      setError(res.error ?? 'That username could not be created.');
      setStatus('idle');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setStatus('idle');
    }
  }

  return (
    <ThemedView style={styles.fill}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              VuliStudy
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
              Enter your username to continue
            </ThemedText>

            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                // Re-checking after an edit: drop back to the first step.
                if (status === 'needsCreate') setStatus('idle');
                if (error) setError(null);
              }}
              placeholder="username"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!busy}
              maxLength={20}
              onSubmitEditing={handleContinue}
              returnKeyType="go"
              style={[
                styles.input,
                { color: theme.text, backgroundColor: theme.backgroundElement },
              ]}
            />

            {status === 'needsCreate' && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.helper}>
                No account named “{trimmed}” yet. Create it?
              </ThemedText>
            )}

            {error && (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            )}

            <Pressable
              onPress={status === 'needsCreate' ? handleCreate : handleContinue}
              disabled={busy || !trimmed}
              style={({ pressed }) => [
                styles.button,
                { opacity: busy || !trimmed ? 0.5 : pressed ? 0.85 : 1 },
              ]}>
              {busy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText type="default" style={styles.buttonLabel}>
                  {status === 'needsCreate' ? 'Create account' : 'Continue'}
                </ThemedText>
              )}
            </Pressable>
          </ThemedView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  input: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  helper: {
    textAlign: 'center',
  },
  error: {
    textAlign: 'center',
    color: '#e5484d',
  },
  button: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
