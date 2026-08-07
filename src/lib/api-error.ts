/**
 * The real API serializes errors in two different shapes depending on where
 * they come from: Vine validation failures are `{ errors: [{ message, rule,
 * field }] }`, while custom exceptions (BusinessKeyMismatchException,
 * BranchRequiredException, ForbiddenException, etc.) are `{ message, code,
 * name }` at the response root. Both are checked here.
 */
export function getApiErrorMessage(error: any, fallback = 'Something went wrong'): string {
  return (
    error?.response?.data?.errors?.[0]?.message ??
    error?.response?.data?.message ??
    fallback
  )
}
