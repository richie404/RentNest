import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Building2, Users, Shield, Award, TrendingUp, Heart } from "lucide-react";
import { Link } from "react-router";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-[var(--soft-sky-blue)] via-white to-[var(--warm-gray)]">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--royal-blue)] to-[var(--soft-indigo)] flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <span className="text-5xl font-bold bg-gradient-to-r from-[var(--royal-blue)] to-[var(--soft-indigo)] bg-clip-text text-transparent">
              RentNest
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Connecting People with Their Perfect Home
          </h1>
          <p className="text-xl text-[var(--slate-gray)] max-w-3xl mx-auto">
            Since 2020, we've been revolutionizing the rental experience by making it seamless, secure, and stress-free for both renters and property owners.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[var(--deep-navy)] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <div className="text-white/80">Active Listings</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50,000+</div>
              <div className="text-white/80">Happy Renters</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-white/80">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-[var(--slate-gray)] leading-relaxed">
              To simplify the rental process and create meaningful connections between property owners and renters through trust, transparency, and technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--royal-blue)] to-[var(--soft-indigo)] flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Trust & Safety</h3>
                <p className="text-[var(--slate-gray)]">
                  Every property is verified and inspected to ensure quality and authenticity
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--emerald-accent)] to-[var(--emerald-accent)] flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Innovation</h3>
                <p className="text-[var(--slate-gray)]">
                  Cutting-edge technology and AI-powered recommendations for the best matches
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--lavender-glow)] to-[var(--lavender-glow)] flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Community</h3>
                <p className="text-[var(--slate-gray)]">
                  Building lasting relationships and fostering a supportive rental community
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[var(--royal-blue)] to-[var(--soft-indigo)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied renters and property owners today
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/browse">
              <Button size="lg" className="bg-white text-[var(--royal-blue)] hover:bg-white/90 rounded-full px-8">
                Find a Home
              </Button>
            </Link>
            <Link to="/add-listing">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
