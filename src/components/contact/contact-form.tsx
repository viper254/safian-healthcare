"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const org = formData.get("org") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    // Construct email body with all form details
    const emailBody = `
Name: ${name}
Email: ${email}
Phone: ${phone}
${org ? `Organisation: ${org}` : ''}

Message:
${message}
    `.trim();

    // Construct mailto link with encoded parameters
    const mailtoLink = `mailto:safianmedicalsupplies@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success message
    toast({
      title: "Opening your email client...",
      description: "Please send the pre-filled email to complete your inquiry.",
    });

    // Reset form after a short delay
    setTimeout(() => {
      e.currentTarget.reset();
      setIsSubmitting(false);
    }, 1000);
  }

  return (
    <form
      className="rounded-2xl border bg-card p-6 shadow-sm space-y-5"
      onSubmit={handleSubmit}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="John Doe"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="org">Organisation</Label>
          <Input
            id="org"
            name="org"
            autoComplete="organization"
            placeholder="Company Name (Optional)"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="john@example.com"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="0712345678"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          autoComplete="off"
          placeholder="What can we help you with?"
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          autoComplete="off"
          placeholder="Tell us more about your inquiry..."
          required
          disabled={isSubmitting}
        />
      </div>
      <Button
        type="submit"
        variant="gradient"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  );
}
