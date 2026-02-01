"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { FieldError as RHFFieldError } from "react-hook-form"

// Field - Container principal
const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "vertical" | "horizontal" | "responsive"
  }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field"
    className={cn(
      "group flex gap-2",
      orientation === "vertical" && "flex-col",
      orientation === "horizontal" && "flex-row items-center justify-between",
      orientation === "responsive" && "flex-col sm:flex-row sm:items-center sm:justify-between",
      "data-[invalid=true]:text-red-500",
      className
    )}
    {...props}
  />
))
Field.displayName = "Field"

// FieldSet - Pour grouper plusieurs champs
const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    data-slot="fieldset"
    className={cn("flex flex-col gap-4 border-0 p-0 m-0", className)}
    {...props}
  />
))
FieldSet.displayName = "FieldSet"

// FieldLegend - Titre du fieldset
const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement> & {
    variant?: "default" | "label"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <legend
    ref={ref}
    data-slot="field-legend"
    className={cn(
      "p-0",
      variant === "default" && "text-lg font-semibold",
      variant === "label" && "text-sm font-medium",
      className
    )}
    {...props}
  />
))
FieldLegend.displayName = "FieldLegend"

// FieldGroup - Pour grouper des éléments dans un fieldset
const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-group"
    className={cn(
      "flex flex-col gap-2",
      "data-[slot=checkbox-group]:gap-3",
      className
    )}
    {...props}
  />
))
FieldGroup.displayName = "FieldGroup"

// FieldContent - Container pour le contenu du champ
const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-content"
    className={cn("flex flex-col gap-1", className)}
    {...props}
  />
))
FieldContent.displayName = "FieldContent"

// FieldLabel - Label du champ
const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    data-slot="field-label"
    className={cn(
      "text-sm font-medium leading-none",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      "group-data-[invalid=true]:text-red-500",
      className
    )}
    {...props}
  />
))
FieldLabel.displayName = "FieldLabel"

// FieldTitle - Titre secondaire (pour les radio/checkbox)
const FieldTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="field-title"
    className={cn("text-sm font-medium", className)}
    {...props}
  />
))
FieldTitle.displayName = "FieldTitle"

// FieldDescription - Description du champ
const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="field-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

// FieldError - Affichage des erreurs
interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  errors?: (RHFFieldError | undefined)[]
}

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, errors, ...props }, ref) => {
    const errorMessages = errors
      ?.filter((error): error is RHFFieldError => error !== undefined)
      .map((error) => error.message)
      .filter((message): message is string => message !== undefined)

    if (!errorMessages || errorMessages.length === 0) return null

    return (
      <p
        ref={ref}
        data-slot="field-error"
        className={cn("text-sm font-medium text-red-500", className)}
        role="alert"
        {...props}
      >
        {errorMessages[0]}
      </p>
    )
  }
)
FieldError.displayName = "FieldError"

export {
  Field,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldError,
}
