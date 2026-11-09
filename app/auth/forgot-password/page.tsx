import { redirect } from "next/navigation";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthForgotPasswordRedirect({ searchParams }: Props) {
  const params = (await searchParams) || {};
  const emailRaw = params.email;
  const email = Array.isArray(emailRaw) ? emailRaw[0] : emailRaw;
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  redirect(`/forgot-password${query}`);
}
