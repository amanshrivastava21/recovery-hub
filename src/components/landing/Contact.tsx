import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    toast({ title: "Message Sent!", description: "We'll get back to you soon." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
          Contact Us
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help?"
                rows={4}
              />
              {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Email</h4>
                <p className="text-sm text-muted-foreground">info@jeevansudhar.org</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Phone</h4>
                <p className="text-sm text-muted-foreground">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Address</h4>
                <p className="text-sm text-muted-foreground">
                  123 Recovery Road, New Delhi, India — 110001
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
