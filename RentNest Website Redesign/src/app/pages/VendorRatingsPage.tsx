import React, { useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useVendorRatingsQuery, useReplyReviewMutation } from "@/features/vendor/hooks/useVendorData";
import { showToast } from "@/components/ui/Toast";

export const VendorRatingsPage: React.FC = () => {
  const { data: ratings } = useVendorRatingsQuery();
  const replyMutation = useReplyReviewMutation();

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyMutation.mutate(
      { reviewId, replyText },
      {
        onSuccess: () => {
          showToast.success("Reply Posted", "Response submitted to customer review.");
          setActiveReplyId(null);
          setReplyText("");
        },
      }
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Customer Satisfaction & Rating Reviews
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitor property owner and tenant reviews, rating breakdown distribution, and publish official responses.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" className="p-6 text-center space-y-2">
          <span className="font-heading text-4xl font-extrabold text-foreground">{ratings?.averageRating}</span>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground block">Overall Average Rating</span>
        </Card>

        <Card variant="default" className="p-6 md:col-span-2 space-y-2">
          <h3 className="font-heading text-xs font-bold text-foreground">Rating Score Distribution</h3>
          <div className="space-y-1.5 pt-1">
            {ratings?.ratingDistribution?.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-foreground">{dist.stars} Stars</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(dist.count / (ratings.totalReviews || 1)) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">{dist.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Reviews Stream */}
      <div className="space-y-4">
        <h3 className="font-heading text-base font-bold text-foreground">Recent Customer Reviews</h3>
        {ratings?.recentReviews?.map((rev) => (
          <Card key={rev.id} variant="default" className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div>
                <h4 className="font-heading text-xs font-bold text-foreground">{rev.reviewerName}</h4>
                <span className="text-[10px] text-muted-foreground">{rev.date}</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{rev.comment}</p>

            {rev.reply ? (
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs space-y-1 ml-4">
                <span className="font-bold text-primary block">Your Official Reply ({rev.replyDate})</span>
                <p className="text-foreground">{rev.reply}</p>
              </div>
            ) : (
              <div>
                {activeReplyId === rev.id ? (
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Write public reply to customer..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="text-xs"
                    />
                    <Button variant="primary" size="sm" onClick={() => handleSendReply(rev.id)}>
                      Post
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveReplyId(rev.id)}
                    leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
                  >
                    Reply to Review
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VendorRatingsPage;
