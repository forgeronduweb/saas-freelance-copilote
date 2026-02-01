"use client"

import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"

const schema = z.object({
  type: z.enum(["bug", "idea", "other"]),
  email: z
    .string()
    .trim()
    .email("Email invalide")
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(3, "Minimum 3 caractères").max(4000, "Maximum 4000 caractères"),
})

type FormData = z.infer<typeof schema>

export default function FeedbackPage() {
  const pathname = usePathname()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const defaultValues = useMemo<FormData>(
    () => ({
      type: "other",
      email: "",
      message: "",
    }),
    []
  )

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const res = await fetch("/api/dashboard/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: data.type,
          email: data.email?.trim() || undefined,
          message: data.message,
          pageUrl: pathname,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setSubmitError(result?.error || "Erreur lors de l'envoi")
        return
      }

      form.reset(defaultValues)
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch {
      setSubmitError("Erreur de connexion au serveur")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <CardDescription>
            Ton retour aide à améliorer la plateforme. Tu peux signaler un bug, proposer une idée ou laisser un
            commentaire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Type</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="idea">Idée</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel>Email (optionnel)</FieldLabel>
              <Input
                type="email"
                placeholder="pour te recontacter si besoin"
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
              />
              <FieldDescription>Si tu veux qu'on puisse te répondre.</FieldDescription>
              <FieldError errors={[form.formState.errors.email]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.message}>
              <FieldLabel>Message</FieldLabel>
              <Textarea
                rows={6}
                placeholder="Décris ton retour le plus précisément possible…"
                {...form.register("message")}
                aria-invalid={!!form.formState.errors.message}
              />
              <FieldError errors={[form.formState.errors.message]} />
            </Field>

            {submitError && <p className="text-sm text-red-500">{submitError}</p>}
            {submitSuccess && <p className="text-sm text-green-600">Merci, ton feedback a bien été envoyé.</p>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Envoyer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
