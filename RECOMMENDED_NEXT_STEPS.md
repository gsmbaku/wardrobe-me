# Recommended Next Steps

This roadmap is tailored for a personal-use wardrobe app focused on improving style, organizing your closet, and making confident outfit decisions.

## Prioritized Next Steps

### Phase 1: Fix Foundations and Quick Wins

These should come first because the app needs trustworthy data before it becomes a daily styling tool.

1. **Complete backup and restore**
   - Ensure all local data round-trips correctly: items, outfits, wear logs, notes, storage spaces, events, conversations, and images.
   - Keep old backup files backward-compatible where practical.

2. **Fix data integrity bugs**
   - Replace item images correctly when editing an item.
   - Clean up outfit, wear log, event, and chat references when items or outfits are deleted.
   - Make storage space assignment available directly from item add/edit flows.

3. **Add richer wardrobe filters and sorting**
   - Filter by tags, fit, storage location, for-sale status, wear count, and cost-per-wear.
   - Sort by most worn, least worn, recently added, price, and cost-per-wear.

4. **Improve mobile and tunnel testing reliability**
   - Keep `npm run dev:mobile` strict on port `5173`.
   - Use Cloudflare Tunnel for phone testing from cloud environments.
   - Consider a named Cloudflare tunnel later if a stable URL becomes important.

### Phase 2: Build the Daily Styling Core

These are the highest-value personal features because they directly answer, "What should I wear?"

5. **Dress Me**
   - Dedicated daily styling page.
   - Uses weather, occasion, wardrobe metadata, and recent wear history.
   - Generates 3 outfit suggestions from your real closet.
   - Supports one-tap wear logging and saving suggestions as outfits.

6. **Outfit scheduling on the calendar**
   - Support planned outfits for future dates.
   - Distinguish planned outfits from actual wear logs.
   - Allow event-based outfit planning.

7. **Style Check**
   - Upload or capture a mirror selfie.
   - Get AI feedback on color cohesion, proportion, formality match, and suggested swaps.
   - Use this as the confidence check before leaving the house.

8. **Color harmony scoring**
   - Score generated outfit combinations for color compatibility.
   - Prefer outfits with cohesive palettes.
   - Surface simple explanations like "navy and beige balance well."

### Phase 3: Make Closet Maintenance Easier

These reduce friction so the closet stays accurate over time.

9. **Background removal on upload**
   - Turn quick closet photos into clean item images.
   - Improve the visual quality of wardrobe and outfit cards.

10. **AI auto-tagging on upload**
    - Pre-fill category, color, season, tags, and formality from the clothing photo.
    - Let the user confirm or edit instead of filling every field manually.

11. **Image cleanup or beautify**
    - Improve lighting, crop, and presentation of item photos.
    - Useful for older uploaded images.

12. **Bulk add mode**
    - Fast photo-to-item flow for cataloging multiple pieces in one session.
    - Minimize clicks between items.

13. **Web clip or URL import**
    - Add items from retailer pages using a URL or clipped image.
    - Useful for new purchases and wishlist items.

### Phase 4: Build Wardrobe Intelligence

These help you understand your style patterns and shop more intentionally.

14. **Cost-per-wear dashboard**
    - Calculate `price / wearCount`.
    - Highlight best-value items and expensive items that are rarely worn.
    - Show total wardrobe investment.

15. **Wardrobe composition insights**
    - Color palette owned vs. color palette actually worn.
    - Category balance.
    - Season coverage.
    - Least-worn and never-worn callouts.

16. **Wardrobe gap analysis**
    - Identify imbalances like too many tops and not enough bottoms.
    - Suggest gaps based on your real outfits and occasions.

17. **Seasonal review**
    - Summarize what you wore most this season.
    - Identify items to rotate out, sell, repair, or re-style.
    - Track how your style changes over time.

### Phase 5: Trips and Collections

These help with themed dressing and travel planning.

18. **Lookbooks**
    - Create named collections such as Work Week, Summer Trip, Date Night, Gym, or Rainy Days.
    - Group outfits and standalone items.
    - Let Dress Me generate from a selected lookbook.

19. **Packing lists**
    - Build a trip from dates, destination, and weather.
    - Assign outfits per day.
    - Generate an itemized checklist.
    - Suggest commonly forgotten items like socks, belts, rain layers, or workout gear.

20. **Wishlist**
    - Track items you are considering buying.
    - Compare wishlist items against wardrobe gaps before purchasing.

## Suggested Build Order

| Priority | Feature | Why |
| --- | --- | --- |
| 1 | Data fixes and full backup | Trustworthy data is required before daily use |
| 2 | Dress Me | Highest-impact daily decision feature |
| 3 | Outfit scheduling on calendar | Turns suggestions into plans |
| 4 | Background removal and AI auto-tagging | Reduces cataloging friction |
| 5 | Style Check | Builds confidence before leaving |
| 6 | Cost-per-wear, color stats, and gap analysis | Helps improve style and shopping habits |
| 7 | Lookbooks | Organizes outfits by lifestyle and occasion |
| 8 | Packing lists | Adds a strong travel workflow |
| 9 | Web clip import | Makes adding new purchases easier |
| 10 | PWA/mobile polish | Makes the app feel native and easy to use at the mirror |

## Near-Term Focus

If only three things are tackled next, prioritize:

1. **Dress Me**
2. **Style Check**
3. **Background removal with AI auto-tagging**

These create the core habit loop: maintain the closet, get a strong outfit recommendation, verify it with feedback, and log what you actually wore.
