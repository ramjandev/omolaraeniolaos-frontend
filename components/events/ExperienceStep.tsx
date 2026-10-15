"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ExperienceFormValues } from "@/lib/validations/eventWizardSchemas";
import { EXPERIENCE_LANGUAGES, REMINDER_LEADS } from "@/store/eventSlice/eventSlice";
import { cn } from "@/lib/utils";
import { Check, Globe, Info, MessageSquare, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

const RESPONSE_VARIABLES = [
  { label: "{ Guest Name }", token: "{guest_name}" },
  { label: "{ Event Name }", token: "{event_name}" },
  { label: "{ Event Date }", token: "{event_date}" },
  { label: "{ Host Name }", token: "{host_name}" },
] as const;

const COLLECT_FIELDS = [
  { name: "collectPartySize", label: "Party Size (Plus Ones)" },
  { name: "collectDietary", label: "Dietary Requirements" },
  { name: "collectAccessibility", label: "Accessibility Needs" },
  { name: "collectRelationship", label: "Relationship to Host" },
  { name: "collectProtocol", label: "Protocol Requirements (VIPs)" },
  { name: "collectSeating", label: "Seating Preferences" },
] as const;

interface ExperienceStepProps {
  form: UseFormReturn<ExperienceFormValues>;
  onContinue: () => void;
  continueLabel: string;
  disabled?: boolean;
}

export function ExperienceStep({
  form,
  onContinue,
  continueLabel,
  disabled,
}: ExperienceStepProps) {
  const { control, register, setValue, getValues, formState } = form;

  const insertVariable = (
    field: "confirmedMessage" | "tentativeMessage" | "declinedMessage",
    token: string,
  ) => {
    const current = getValues(field) ?? "";
    const next = current.trim().length === 0 ? token : `${current.trimEnd()} ${token}`;
    setValue(field, next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-[#1F140E] dark:text-foreground">
          Personalize The Guest Experience
        </h2>
        <p className="mt-1 text-sm text-[#6F6761] dark:text-muted-foreground">
          Tailor how your guests interact with your invitation.
        </p>
      </div>

      <div className="space-y-4 rounded-3xl border border-[#EBE3D9] bg-white p-4 shadow-xs dark:border-border dark:bg-card md:p-6">
        <Section
          icon={<Globe className="h-4 w-4 text-[#1F8A4C]" />}
          title="Languages"
          subtitle="Select the languages available to your guests. They can switch languages anytime."
        >
          <Controller
            control={control}
            name="languages"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LANGUAGES.map((language) => {
                  const selected = field.value.includes(language);
                  const isDefault = language === "English";
                  return (
                    <button
                      key={language}
                      type="button"
                      onClick={() => {
                        if (isDefault) return;
                        const next = selected
                          ? field.value.filter((item) => item !== language)
                          : [...field.value, language];
                        field.onChange(next.includes("English") ? next : ["English", ...next]);
                      }}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                        selected
                          ? "border-[#1F140E] bg-[#1F140E] text-white"
                          : "border-[#E4DDD4] bg-white text-[#3D342F] hover:border-[#1F140E]/40 dark:bg-card dark:text-foreground",
                      )}
                    >
                      {isDefault ? "English (Default)" : language}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </Section>

        <Section
          icon={<MessageSquare className="h-4 w-4 text-[#C47B2B]" />}
          title="RSVP Methods"
          subtitle="Choose how guests can reply to your invitation."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <MethodCard
              control={control}
              name="methodOneClick"
              title="One-Click Button"
              description="Standard web button RSVP"
            />
            <MethodCard
              control={control}
              name="methodText"
              title="Text Message"
              description="Guests reply via SMS/WhatsApp"
            />
            <MethodCard
              control={control}
              name="methodVoice"
              title="Voice RSVP"
              description="Guests can leave a voice note"
            />
          </div>
          {formState.errors.methodOneClick?.message && (
            <p className="text-xs text-red-600">{formState.errors.methodOneClick.message}</p>
          )}
        </Section>

        <Section
          icon={<Info className="h-4 w-4 text-[#C47B2B]" />}
          title="Information to Collect"
          subtitle="What should guests provide when they RSVP? Keep it simple to increase responses."
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {COLLECT_FIELDS.map((item) => (
              <label key={item.name} className="flex items-center gap-2.5 text-sm text-[#3D342F] dark:text-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#CFC7BD] accent-[#6E3B1C]"
                  {...register(item.name)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </Section>

        <Section
          icon={<Users className="h-4 w-4 text-[#7C5CBF]" />}
          title="Guest Responses"
          subtitle="Choose which responses guests can give to your invitation."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <ResponseCard
              title="Confirmed"
              description="Guest is attending"
              checked
              locked
              status="Required"
            />
            <Controller
              control={control}
              name="allowTentative"
              render={({ field }) => (
                <ResponseCard
                  title="Tentative"
                  description="Guest is not sure yet"
                  checked={field.value}
                  status={field.value ? "Enabled" : "Disabled"}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <ResponseCard
              title="Declined"
              description="Guest cannot attend"
              checked
              locked
              status="Required"
            />
          </div>
        </Section>

        <Section
          icon={<MessageSquare className="h-4 w-4 text-[#8C4B24]" />}
          title="Response Messages"
          subtitle="Customize the message guests receive immediately after they choose a response."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <MessageField
              label="Confirmed Response"
              error={formState.errors.confirmedMessage?.message}
              register={register("confirmedMessage")}
              onInsert={(token) => insertVariable("confirmedMessage", token)}
            />
            <MessageField
              label="Tentative Response"
              error={formState.errors.tentativeMessage?.message}
              register={register("tentativeMessage")}
              onInsert={(token) => insertVariable("tentativeMessage", token)}
            />
            <MessageField
              label="Declined Response"
              error={formState.errors.declinedMessage?.message}
              register={register("declinedMessage")}
              onInsert={(token) => insertVariable("declinedMessage", token)}
            />
          </div>
        </Section>

        <Section
          icon={<Users className="h-4 w-4 text-[#8C4B24]" />}
          title="After a Tentative Response"
          subtitle="Configure automated follow-ups for undecided guests."
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <label className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-[#CFC7BD] accent-[#6E3B1C]"
                  {...register("sendTentativeReminder")}
                />
                <span>
                  <span className="block text-sm font-medium text-[#1F140E] dark:text-foreground">
                    Send a reminder before RSVP deadline
                  </span>
                  <span className="block text-xs text-[#6F6761] dark:text-muted-foreground">
                    Configure automated follow-ups for undecided guests.
                  </span>
                </span>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  {...register("reminderLead")}
                  className="h-11 rounded-xl border border-[#E4DDD4] bg-[#FBF8F4] px-3 text-sm text-[#1F140E] dark:border-border dark:bg-card dark:text-foreground"
                >
                  {REMINDER_LEADS.map((lead) => (
                    <option key={lead} value={lead}>
                      {lead}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  {...register("rsvpDeadline")}
                  className="h-11 rounded-xl border border-[#E4DDD4] bg-[#FBF8F4] px-3 text-sm text-[#1F140E] dark:border-border dark:bg-card dark:text-foreground"
                />
              </div>
              {formState.errors.rsvpDeadline?.message && (
                <p className="text-xs text-red-600">{formState.errors.rsvpDeadline.message}</p>
              )}
            </div>

            <label className="flex items-start gap-2.5">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-[#CFC7BD] accent-[#6E3B1C]"
                {...register("allowResponseUpdate")}
              />
              <span>
                <span className="block text-sm font-medium text-[#1F140E] dark:text-foreground">
                  Allow guest to update their response anytime
                </span>
                <span className="block text-xs text-[#6F6761] dark:text-muted-foreground">
                  They can text &quot;RSVP&quot; to change their status.
                </span>
              </span>
            </label>
          </div>
        </Section>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={disabled}
          onClick={onContinue}
          className="h-11 rounded-xl bg-[#6E3B1C] px-5 text-sm font-medium text-white hover:bg-[#5C3117]"
        >
          {continueLabel}
        </Button>
      </div>
    </section>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#EFE7DE] bg-white p-4 dark:border-border dark:bg-card md:p-5">
      <div className="mb-4 flex items-start gap-2.5">
        <span className="mt-0.5">{icon}</span>
        <div>
          <h3 className="text-base font-medium text-[#1F140E] dark:text-foreground">{title}</h3>
          <p className="text-sm text-[#6F6761] dark:text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function MethodCard({
  control,
  name,
  title,
  description,
}: {
  control: UseFormReturn<ExperienceFormValues>["control"];
  name: "methodOneClick" | "methodText" | "methodVoice";
  title: string;
  description: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <button
          type="button"
          onClick={() => field.onChange(!field.value)}
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors",
            field.value
              ? "border-[#E7D3C4] bg-[#FBF6F1]"
              : "border-[#EBE3D9] bg-white hover:border-[#6E3B1C]/30 dark:bg-card",
          )}
        >
          <span>
            <span className="block text-sm font-medium text-[#1F140E] dark:text-foreground">{title}</span>
            <span className="mt-0.5 block text-xs text-[#6F6761] dark:text-muted-foreground">{description}</span>
          </span>
          <span
            className={cn(
              "grid h-6 w-6 shrink-0 place-items-center rounded-full border",
              field.value ? "border-[#6E3B1C] text-[#6E3B1C]" : "border-[#D6D0C8] text-transparent",
            )}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
        </button>
      )}
    />
  );
}

function ResponseCard({
  title,
  description,
  checked,
  status,
  locked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  status: string;
  locked?: boolean;
  onCheckedChange?: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#EFE7DE] bg-[#FBF8F4] px-4 py-3 dark:border-border dark:bg-muted/20">
      <div>
        <div className="text-sm font-medium text-[#1F140E] dark:text-foreground">{title}</div>
        <div className="text-xs text-[#6F6761] dark:text-muted-foreground">{description}</div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Switch
          checked={checked}
          disabled={locked}
          onCheckedChange={onCheckedChange}
          className="data-[state=checked]:bg-[#6E3B1C]"
        />
        <span className="text-[11px] text-[#6F6761]">{status}</span>
      </div>
    </div>
  );
}

function MessageField({
  label,
  error,
  register,
  onInsert,
}: {
  label: string;
  error?: string;
  register: ReturnType<UseFormReturn<ExperienceFormValues>["register"]>;
  onInsert: (token: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#1F140E] dark:text-foreground">
        {label} <span className="text-red-500">*</span>
      </label>
      <textarea
        rows={5}
        {...register}
        className="w-full resize-none rounded-2xl border border-[#E7D3C4] bg-[#FBF6F1] px-3 py-3 text-sm leading-relaxed text-[#3D342F] outline-none focus:ring-1 focus:ring-[#6E3B1C]/30 dark:border-border dark:bg-muted/20 dark:text-foreground"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div>
        <div className="mb-1.5 text-[11px] text-[#6F6761]">Available Variables</div>
        <div className="flex flex-wrap gap-1.5">
          {RESPONSE_VARIABLES.map((variable) => (
            <button
              key={variable.token}
              type="button"
              onClick={() => onInsert(variable.token)}
              className="rounded-lg border border-[#E4DDD4] bg-white px-2 py-1 text-[11px] text-[#3D342F] hover:border-[#6E3B1C]/40 dark:bg-card dark:text-foreground"
            >
              {variable.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
