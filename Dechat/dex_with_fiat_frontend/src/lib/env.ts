import { z } from 'zod';

<<<<<<< HEAD
const serverSchema = z.object({
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYOUT_PROVIDER: z.string().default('paystack'),
  ADMIN_API_TOKEN: z.string().optional(),
  ADMIN_IP_ALLOWLIST: z.string().optional(),
=======
/**
 * Zod schema for server-side environment variables.
 *
 * These variables are only accessible on the server and must be set in the
 * server environment (e.g., .env file, deployment platform secrets). They
 * are never exposed to the client.
 *
 * @example
 * ```typescript
 * // In .env file:
 * PAYSTACK_SECRET_KEY=sk_test_xxx
 * PAYOUT_PROVIDER=paystack
 * ADMIN_API_TOKEN=secret_token
 * ADMIN_IP_ALLOWLIST=192.168.1.1,10.0.0.1
 * ADMIN_IP_ALLOWLIST_BYPASS_LOCAL=true
 * ADMIN_SECRET=admin_secret
 * GEMINI_API_KEY=gemini_key
 * ```
 */
const serverSchema = z.object({
  /** Paystack secret key for payment processing. Required for Paystack integration. */
  PAYSTACK_SECRET_KEY: z.string().optional(),
  /** Payout provider to use for withdrawals. Defaults to 'paystack'. */
  PAYOUT_PROVIDER: z.string().default('paystack'),
  /** API token for admin operations. Used to authenticate admin API requests. */
  ADMIN_API_TOKEN: z.string().optional(),
  /** Comma-separated list of allowed IP addresses for admin access. */
  ADMIN_IP_ALLOWLIST: z.string().optional(),
  /** Whether to bypass IP allowlist checks for localhost. Defaults to false. */
>>>>>>> emwulrd/main
  ADMIN_IP_ALLOWLIST_BYPASS_LOCAL: z.preprocess((value: unknown) => {
    if (typeof value !== 'string') return false;
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1';
  }, z.boolean().default(false)),
<<<<<<< HEAD
  ADMIN_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_FIAT_BRIDGE_CONTRACT: z
    .string()
    .default('CAWYXBN4PSVXD7NIYEWVFFIIIEUCC6PUN3IMG3J2WHKDB4NVIISMXBPR'),
  NEXT_PUBLIC_XLM_SAC_CONTRACT: z
    .string()
    .default('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'),
  NEXT_PUBLIC_STELLAR_RPC_URL: z
    .string()
    .default('https://soroban-testnet.stellar.org'),
  NEXT_PUBLIC_GEMINI_API_KEY: z.string().optional(),
});

=======
  /** Secret key for admin authentication. Used for sensitive admin operations. */
  ADMIN_SECRET: z.string().optional(),
  /** API key for Gemini AI integration. Used for AI-powered features. */
  GEMINI_API_KEY: z.string().optional(),
});

/**
 * Zod schema for client-side environment variables.
 *
 * These variables are prefixed with `NEXT_PUBLIC_` and are exposed to the client.
 * They should only contain non-sensitive configuration data.
 *
 * @example
 * ```typescript
 * // In .env file:
 * NEXT_PUBLIC_FIAT_BRIDGE_CONTRACT=CAWYXBN4PSVXD7NIYEWVFFIIIEUCC6PUN3IMG3J2WHKDB4NVIISMXBPR
 * NEXT_PUBLIC_XLM_SAC_CONTRACT=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
 * NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
 * NEXT_PUBLIC_GEMINI_API_KEY=public_gemini_key
 * ```
 */
const clientSchema = z.object({
  /** Stellar contract address for the fiat bridge. Defaults to testnet contract. */
  NEXT_PUBLIC_FIAT_BRIDGE_CONTRACT: z
    .string()
    .default('CAWYXBN4PSVXD7NIYEWVFFIIIEUCC6PUN3IMG3J2WHKDB4NVIISMXBPR'),
  /** Stellar Asset Contract (SAC) address for XLM. Defaults to testnet SAC. */
  NEXT_PUBLIC_XLM_SAC_CONTRACT: z
    .string()
    .default('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'),
  /** Stellar Soroban RPC URL for blockchain interaction. Defaults to testnet. */
  NEXT_PUBLIC_STELLAR_RPC_URL: z
    .string()
    .default('https://soroban-testnet.stellar.org'),
  /** Public API key for Gemini AI (client-side). Optional, for client AI features. */
  NEXT_PUBLIC_GEMINI_API_KEY: z.string().optional(),
});

/**
 * Formats Zod validation errors into a human-readable string.
 *
 * This helper function transforms Zod's error object into a newline-separated
 * string of error messages, making it easier to display validation failures to
 * developers or logs.
 *
 * @param errors - The formatted error object from Zod's `error.format()` method.
 * @returns A string containing formatted error messages, one per line.
 *
 * @example
 * ```typescript
 * const errors = parsed.error.format();
 * const formatted = formatErrors(errors);
 * console.error('Invalid environment variables:\n', formatted);
 * // Output:
 * // PAYSTACK_SECRET_KEY: Required
 * // ADMIN_API_TOKEN: Invalid string
 * ```
 */
>>>>>>> emwulrd/main
const formatErrors = (
  errors: z.ZodFormattedError<Map<string, string>, string>,
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && '_errors' in value && value._errors.length) {
        return `${name}: ${value._errors.join(', ')}`;
      }
      return null;
    })
    .filter(Boolean)
    .join('\n');

<<<<<<< HEAD
=======
/**
 * Processes and validates environment variables for the application.
 *
 * This function validates both client-side and server-side environment variables
 * against their respective Zod schemas. It runs at build time and runtime to
 * ensure all required environment variables are present and correctly typed.
 *
 * On the server, it validates both client and server schemas and returns the
 * merged result. On the client, it only validates the client schema (server
 * variables are not accessible on the client for security reasons).
 *
 * @returns A validated object containing all environment variables with their
 *          inferred types. Throws an error if validation fails.
 *
 * @throws {Error} If client or server environment variables fail validation.
 *
 * @example
 * ```typescript
 * // Import and use the validated env object
 * import { env } from '@/lib/env';
 *
 * // Access validated environment variables
 * const contractAddress = env.NEXT_PUBLIC_FIAT_BRIDGE_CONTRACT;
 * const rpcUrl = env.NEXT_PUBLIC_STELLAR_RPC_URL;
 * const paystackKey = env.PAYSTACK_SECRET_KEY; // Only on server
 *
 * // TypeScript will provide autocomplete and type checking
 * ```
 */
>>>>>>> emwulrd/main
const processEnvVars = () => {
  const isServer = typeof window === 'undefined';

  const clientVars = {
    NEXT_PUBLIC_FIAT_BRIDGE_CONTRACT:
      (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIAT_BRIDGE_CONTRACT : undefined),
    NEXT_PUBLIC_XLM_SAC_CONTRACT: (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_XLM_SAC_CONTRACT : undefined),
    NEXT_PUBLIC_STELLAR_RPC_URL: (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_STELLAR_RPC_URL : undefined),
    NEXT_PUBLIC_GEMINI_API_KEY: (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GEMINI_API_KEY : undefined),
  };

  const parsedClient = clientSchema.safeParse(clientVars);

  if (!parsedClient.success) {
    console.error(
      '❌ Invalid client environment variables:\n',
      formatErrors(parsedClient.error.format()),
    );
    throw new Error('Invalid client environment variables');
  }

  if (isServer) {
    const serverVars = {
      PAYSTACK_SECRET_KEY: (typeof process !== 'undefined' ? process.env.PAYSTACK_SECRET_KEY : undefined),
      PAYOUT_PROVIDER: (typeof process !== 'undefined' ? process.env.PAYOUT_PROVIDER : undefined),
      ADMIN_API_TOKEN: (typeof process !== 'undefined' ? process.env.ADMIN_API_TOKEN : undefined),
      ADMIN_IP_ALLOWLIST: (typeof process !== 'undefined' ? process.env.ADMIN_IP_ALLOWLIST : undefined),
      ADMIN_IP_ALLOWLIST_BYPASS_LOCAL: (typeof process !== 'undefined' ? process.env.ADMIN_IP_ALLOWLIST_BYPASS_LOCAL : undefined),
      ADMIN_SECRET: (typeof process !== 'undefined' ? process.env.ADMIN_SECRET : undefined),
      GEMINI_API_KEY: (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined),
    };

    const parsedServer = serverSchema.safeParse(serverVars);

    if (!parsedServer.success) {
      console.error(
        '❌ Invalid server environment variables:\n',
        formatErrors(parsedServer.error.format()),
      );
      throw new Error('Invalid server environment variables');
    }

    return { ...parsedClient.data, ...parsedServer.data };
  }

  return parsedClient.data as typeof parsedClient.data &
    z.infer<typeof serverSchema>;
};

<<<<<<< HEAD
=======
/**
 * Validated environment variables object.
 *
 * This is the exported entry point for accessing environment variables throughout
 * the application. It is the result of calling `processEnvVars()` at module
 * initialization time, which validates all environment variables against their
 * schemas.
 *
 * All environment variables accessed through this object are type-safe and have
 * been validated at startup. TypeScript will provide autocomplete and type
 * checking for all available variables.
 *
 * @example
 * ```typescript
 * import { env } from '@/lib/env';
 *
 * // Client-side variables (accessible everywhere)
 * const contractAddress = env.NEXT_PUBLIC_FIAT_BRIDGE_CONTRACT;
 * const rpcUrl = env.NEXT_PUBLIC_STELLAR_RPC_URL;
 *
 * // Server-side variables (only accessible in server components/API routes)
 * const paystackKey = env.PAYSTACK_SECRET_KEY;
 * const adminToken = env.ADMIN_API_TOKEN;
 * ```
 *
 * @see {@link serverSchema} for server-side variable definitions
 * @see {@link clientSchema} for client-side variable definitions
 * @see {@link processEnvVars} for the validation logic
 */
>>>>>>> emwulrd/main
export const env = processEnvVars();
