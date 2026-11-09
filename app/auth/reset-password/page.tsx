import { redirect } from "next/navigation";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthResetPasswordRedirect({ searchParams }: Props) {
  const params = (await searchParams) || {};
  const tokenRaw = params.token ?? params.code;
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw;
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  redirect(`/reset-password${query}`);
}
