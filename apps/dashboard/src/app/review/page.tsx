"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Send, ArrowLeft } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReviewPage() {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const displayValue = hoverRating ?? rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating == null) {
      toast.error("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
          displayName: displayName.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setSubmitted(true);
        setRating(null);
        setComment("");
        setDisplayName("");
        toast.success("Thank you for your review!");
      } else {
        toast.error(data.error ?? "Failed to submit. Please try again.");
      }
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="container mx-auto px-4 py-16 md:py-24 max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="text-center py-12">
            <div className="inline-flex h-16 w-16 rounded-full bg-primary/10 items-center justify-center mb-6">
              <Star className="h-8 w-8 text-primary fill-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Thanks for your review!</h1>
            <p className="text-muted-foreground mt-2">
              Your feedback helps us improve and helps other teams discover AgentMD.
            </p>
            <Link href="/" className="mt-8 inline-block">
              <Button variant="outline">Back to home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leave a Review</h1>
            <p className="text-muted-foreground mt-1">
              How would you rate AgentMD? Your feedback helps others discover agent-ready workflows.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Rating *</label>
            <div className="flex gap-1" role="group" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  aria-pressed={rating === value}
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      (displayValue ?? 0) >= value
                        ? "text-amber-500 fill-amber-500"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {displayValue == null
                ? "Click to select"
                : `${displayValue} star${displayValue > 1 ? "s" : ""}`}
            </p>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-2">
              Name (optional)
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you'd like to be shown"
              maxLength={64}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Review (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="What do you like? What could be better?"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{comment.length}/2000</p>
          </div>

          <Button type="submit" disabled={submitting || rating == null} className="w-full sm:w-auto">
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit review
              </>
            )}
          </Button>
        </form>

        <p className="mt-8 text-sm text-muted-foreground">
          Reviews may be displayed on our website. By submitting, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </main>
      <Footer />
    </div>
  );
}
