import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Search,
  MapPin,
  DollarSign,
  Home,
  Calendar,
  Users,
  Star,
  Heart,
  TrendingUp,
  Shield,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
  Building2,
  ArrowRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";

const featuredProperties = [
  {
    id: 1,
    title: "Modern Luxury Apartment",
    location: "Manhattan, New York",
    price: 3500,
    rating: 4.9,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1680416124510-5eae1beca412?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    type: "Apartment",
    beds: 2,
    baths: 2,
  },
  {
    id: 2,
    title: "Elegant Downtown Studio",
    location: "Brooklyn, New York",
    price: 2200,
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1682184805271-11671b7ecf4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    type: "Studio",
    beds: 1,
    baths: 1,
  },
  {
    id: 3,
    title: "Spacious Family House",
    location: "Queens, New York",
    price: 4800,
    rating: 5.0,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1728721529009-bfaab6fcc8e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    type: "House",
    beds: 4,
    baths: 3,
  },
  {
    id: 4,
    title: "Cozy Urban Loft",
    location: "Manhattan, New York",
    price: 2900,
    rating: 4.7,
    reviews: 94,
    image: "https://images.unsplash.com/photo-1663811397207-418a92396ad5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    type: "Loft",
    beds: 1,
    baths: 1,
  },
];

const popularCities = [
  {
    name: "New York",
    properties: 1234,
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
  {
    name: "Los Angeles",
    properties: 987,
    image: "https://images.unsplash.com/photo-1483653364400-eedcfb9f1f88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
  {
    name: "Chicago",
    properties: 756,
    image: "https://images.unsplash.com/photo-1495954380655-01609180eda3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
  {
    name: "San Francisco",
    properties: 654,
    image: "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
];

const categories = [
  { name: "Apartments", count: 1456, icon: Building2 },
  { name: "Houses", count: 892, icon: Home },
  { name: "Studios", count: 654, icon: Building2 },
  { name: "Shared Spaces", count: 423, icon: Users },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Renter",
    content: "RentNest made finding my dream apartment so easy! The platform is intuitive and the listings are verified.",
    rating: 5,
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Property Owner",
    content: "As a property owner, I love how RentNest handles everything. Great analytics and responsive support.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Emily Rodriguez",
    role: "Renter",
    content: "Best rental experience ever! Found my place in just 3 days. Highly recommend RentNest to everyone.",
    rating: 5,
    avatar: "ER",
  },
];

export function HomePage() {
  const [location, setLocation] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--soft-sky-blue)] via-white to-[var(--warm-gray)]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgzMCw5NCwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Floating Stats */}
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--royal-blue)]/10 flex items-center justify-center">
                    <Home className="w-6 h-6 text-[var(--royal-blue)]" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-2xl">10,000+</div>
                    <div className="text-sm text-muted-foreground">Properties</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--emerald-accent)]/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[var(--emerald-accent)]" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-2xl">50,000+</div>
                    <div className="text-sm text-muted-foreground">Happy Renters</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[var(--deep-navy)] to-[var(--royal-blue)] bg-clip-text text-transparent">
              Find Your Perfect Rental Home
            </h1>
            <p className="text-xl md:text-2xl text-[var(--slate-gray)] mb-12 max-w-3xl mx-auto">
              Discover premium properties, verified listings, and seamless booking experience in one platform.
            </p>

            {/* Search Bar */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl max-w-4xl mx-auto">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--slate-gray)]" />
                      <Input
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10 h-12 border-0 bg-[var(--warm-gray)] rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <Select>
                      <SelectTrigger className="h-12 border-0 bg-[var(--warm-gray)] rounded-2xl">
                        <SelectValue placeholder="Property Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="shared">Shared Space</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-1">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--slate-gray)]" />
                      <Input
                        placeholder="Max Budget"
                        type="number"
                        className="pl-10 h-12 border-0 bg-[var(--warm-gray)] rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <Link to="/browse">
                      <Button className="w-full h-12 bg-gradient-to-r from-[var(--royal-blue)] to-[var(--soft-indigo)] hover:opacity-90 transition-opacity rounded-2xl text-base">
                        <Search className="w-5 h-5 mr-2" />
                        Search
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="flex justify-center gap-4 mt-8 flex-wrap">
              <Link to="/browse">
                <Button size="lg" className="bg-gradient-to-r from-[var(--royal-blue)] to-[var(--soft-indigo)] hover:opacity-90 rounded-full px-8 text-base">
                  Explore Rentals
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/add-listing">
                <Button size="lg" variant="outline" className="rounded-full px-8 border-2 border-[var(--royal-blue)] text-[var(--royal-blue)] hover:bg-[var(--royal-blue)] hover:text-white text-base">
                  List Your Property
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[var(--gold-highlight)]" />
              Featured Properties
            </h2>
            <p className="text-[var(--slate-gray)] text-lg">Handpicked premium rentals just for you</p>
          </div>
          <Link to="/browse">
            <Button variant="ghost" className="text-[var(--royal-blue)] hover:text-[var(--soft-indigo)]">
              View All
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProperties.map((property) => (
            <Card
              key={property.id}
              className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden hover:-translate-y-2"
            >
              <div className="relative overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
                  onClick={() => toggleFavorite(property.id)}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favorites.includes(property.id)
                        ? "fill-[var(--coral-alert)] text-[var(--coral-alert)]"
                        : "text-[var(--slate-gray)]"
                    }`}
                  />
                </Button>
                <Badge className="absolute top-4 left-4 bg-[var(--royal-blue)] text-white border-0">
                  {property.type}
                </Badge>
              </div>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-[var(--royal-blue)]">
                    ${property.price}
                    <span className="text-sm text-[var(--slate-gray)] font-normal">/mo</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[var(--gold-highlight)] text-[var(--gold-highlight)]" />
                    <span className="font-semibold">{property.rating}</span>
                    <span className="text-[var(--slate-gray)] text-sm">({property.reviews})</span>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
                <p className="text-[var(--slate-gray)] flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4" />
                  {property.location}
                </p>
                <div className="flex items-center gap-4 text-sm text-[var(--slate-gray)] mb-4">
                  <span className="flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    {property.beds} Beds
                  </span>
                  <span className="flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    {property.baths} Baths
                  </span>
                </div>
                <Link to={`/property/${property.id}`}>
                  <Button className="w-full bg-gradient-to-r from-[var(--royal-blue)] to-[var(--soft-indigo)] hover:opacity-90 rounded-xl">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-20 bg-[var(--warm-gray)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3">Popular Cities</h2>
            <p className="text-[var(--slate-gray)] text-lg">Explore rentals in top locations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCities.map((city, index) => (
              <Link key={index} to="/browse">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden cursor-pointer hover:-translate-y-2">
                  <div className="relative h-64">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{city.name}</h3>
                      <p className="text-white/90">{city.properties} Properties</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Browse by Category</h2>
          <p className="text-[var(--slate-gray)] text-lg">Find the perfect type of rental for your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={index} to="/browse">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 cursor-pointer hover:-translate-y-2 bg-gradient-to-br from-white to-[var(--soft-sky-blue)]">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--royal-blue)] to-[var(--soft-indigo)] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-[var(--slate-gray)]">{category.count} Listings</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose RentNest */}
      <section className="py-20 bg-gradient-to-br from-[var(--deep-navy)] to-[#1a3a52] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">Why Choose RentNest?</h2>
            <p className="text-white/80 text-lg">Experience the difference with our premium platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[var(--emerald-accent)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Listings</h3>
              <p className="text-white/70">All properties are verified and inspected for quality</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[var(--cyan-accent)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
              <p className="text-white/70">Book your dream rental in just a few clicks</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[var(--gold-highlight)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Recommendations</h3>
              <p className="text-white/70">Smart suggestions based on your preferences</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-[var(--lavender-glow)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
              <p className="text-white/70">Always here to help whenever you need us</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">What Our Users Say</h2>
          <p className="text-[var(--slate-gray)] text-lg">Trusted by thousands of renters and property owners</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-[var(--gold-highlight)] text-[var(--gold-highlight)]"
                    />
                  ))}
                </div>
                <p className="text-[var(--slate-gray)] mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--royal-blue)] to-[var(--soft-indigo)] flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-[var(--slate-gray)]">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[var(--royal-blue)] to-[var(--soft-indigo)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Find Your Perfect Home?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of happy renters and start your journey today
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/browse">
              <Button size="lg" className="bg-white text-[var(--royal-blue)] hover:bg-white/90 rounded-full px-8 text-base">
                Start Searching
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 text-base"
              >
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
