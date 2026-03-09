import type { Destination, Review, Article } from "../types";

export const mockDestinations: Destination[] = [
  {
    id: "1",
    name: "Ibiza",
    slug: "ibiza",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80&auto=format",
    description: "Party and paradise in the Balearic Islands",
    boatCount: 342,
  },
  {
    id: "2",
    name: "Santorini",
    slug: "santorini",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&q=80&auto=format",
    description: "Iconic sunsets and volcanic waters",
    boatCount: 187,
  },
  {
    id: "3",
    name: "Dubrovnik",
    slug: "dubrovnik",
    image: "https://images.unsplash.com/photo-1555990538-1e6c53b44ce5?w=600&q=80&auto=format",
    description: "Crystal clear Adriatic coastline",
    boatCount: 156,
  },
  {
    id: "4",
    name: "Amalfi Coast",
    slug: "amalfi-coast",
    image: "https://images.unsplash.com/photo-1534008897995-27a23e859048?w=600&q=80&auto=format",
    description: "Italian coastal paradise",
    boatCount: 234,
  },
  {
    id: "5",
    name: "Mykonos",
    slug: "mykonos",
    image: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=600&q=80&auto=format",
    description: "Windmills and turquoise waters",
    boatCount: 198,
  },
  {
    id: "6",
    name: "Côte d'Azur",
    slug: "cote-d-azur",
    image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=600&q=80&auto=format",
    description: "The glamorous French Riviera",
    boatCount: 276,
  },
  {
    id: "7",
    name: "Sardinia",
    slug: "sardinia",
    image: "https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=600&q=80&auto=format",
    description: "Hidden coves and emerald seas",
    boatCount: 145,
  },
  {
    id: "8",
    name: "Split",
    slug: "split",
    image: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&q=80&auto=format",
    description: "Gateway to Croatian islands",
    boatCount: 213,
  },
];

export const mockReviews: Review[] = [
  {
    id: "1",
    boatId: "b1",
    userId: "u1",
    userName: "Maria Santos",
    rating: 5,
    comment: "Absolutely incredible experience! The boat was in perfect condition and the skipper was so knowledgeable about the best spots.",
    boatName: "Sea Breeze 42",
    location: "Ibiza, Spain",
    createdAt: new Date("2025-09-15"),
  },
  {
    id: "2",
    boatId: "b2",
    userId: "u2",
    userName: "James Wilson",
    rating: 5,
    comment: "Best family holiday we've ever had. The kids loved it and the booking process was seamless.",
    boatName: "Ocean Dream",
    location: "Santorini, Greece",
    createdAt: new Date("2025-08-22"),
  },
  {
    id: "3",
    boatId: "b3",
    userId: "u3",
    userName: "Sophie Laurent",
    rating: 4,
    comment: "Beautiful catamaran, well-maintained. The only thing was pickup was a bit late, but otherwise perfect.",
    boatName: "Cat Paradise",
    location: "Côte d'Azur, France",
    createdAt: new Date("2025-10-01"),
  },
  {
    id: "4",
    boatId: "b4",
    userId: "u4",
    userName: "Marco Rossi",
    rating: 5,
    comment: "We sailed along the Amalfi coast for 3 days. Unforgettable sunsets and hidden beaches. Highly recommend!",
    boatName: "Bella Vista",
    location: "Amalfi, Italy",
    createdAt: new Date("2025-07-10"),
  },
  {
    id: "5",
    boatId: "b5",
    userId: "u5",
    userName: "Elena Popov",
    rating: 5,
    comment: "Third time booking through BoatHaven. Consistently great service and beautiful boats. My go-to platform.",
    boatName: "Adriatic Star",
    location: "Dubrovnik, Croatia",
    createdAt: new Date("2025-11-05"),
  },
  {
    id: "6",
    boatId: "b6",
    userId: "u6",
    userName: "Tom Anderson",
    rating: 4,
    comment: "Great motor yacht for a day trip. Clean, well-equipped, and the owner was very responsive.",
    boatName: "Speed King",
    location: "Mykonos, Greece",
    createdAt: new Date("2025-08-30"),
  },
];

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "Top 10 Sailing Destinations in the Mediterranean for 2026",
    slug: "top-10-sailing-destinations-mediterranean-2026",
    image: "https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=600&q=80&auto=format",
    summary: "Discover the most breathtaking Mediterranean sailing routes, from hidden Greek coves to the stunning Croatian coastline.",
    content: `<h2>The Mediterranean's Finest Sailing Waters</h2>
<p>The Mediterranean remains the world's premier sailing destination, offering a perfect blend of warm waters, reliable winds, and centuries-old coastal towns. Here are the top 10 destinations for 2026.</p>

<h3>1. Cyclades, Greece</h3>
<p>Island-hopping through the Cyclades is a bucket-list experience. From the iconic whitewashed villages of Santorini to the vibrant nightlife of Mykonos, each island offers a unique character. The Meltemi winds from June to September provide exhilarating sailing conditions.</p>

<h3>2. Croatian Coastline</h3>
<p>With over a thousand islands, Croatia offers endless anchorages and crystal-clear waters. Split and Dubrovnik are perfect starting points, and the Kornati National Park is a sailor's paradise with its rugged, uninhabited islands.</p>

<h3>3. Amalfi Coast, Italy</h3>
<p>Dramatic cliffs, pastel-coloured villages, and world-class cuisine make the Amalfi Coast unforgettable. Sail from Naples to Positano and stop at Capri for the famous Blue Grotto.</p>

<h3>4. Balearic Islands, Spain</h3>
<p>Mallorca, Menorca, Ibiza, and Formentera each have a distinct personality. From Ibiza's legendary beach clubs to Menorca's tranquil coves, there's something for every sailor.</p>

<h3>5. Sardinia &amp; Corsica</h3>
<p>The Strait of Bonifacio between Sardinia and Corsica offers some of the Mediterranean's most dramatic coastal scenery. The Costa Smeralda's emerald waters are simply stunning.</p>

<h3>6. Turkish Riviera</h3>
<p>Turkey's "Turquoise Coast" lives up to its name. Ancient ruins, pine-clad hills, and warm hospitality make this an increasingly popular sailing ground. Fethiye and Gocek are excellent bases.</p>

<h3>7. French Riviera</h3>
<p>From Saint-Tropez to Monaco, the Cote d'Azur oozes glamour. Anchor in the bay of Villefranche-sur-Mer or explore the Lerins Islands off Cannes for a quieter experience.</p>

<h3>8. Ionian Islands, Greece</h3>
<p>Gentler winds than the Aegean make the Ionian Islands ideal for less experienced sailors. Corfu, Kefalonia, and Zakynthos offer lush green landscapes and sheltered bays.</p>

<h3>9. Malta &amp; Gozo</h3>
<p>These small islands pack a punch with their ancient temples, vibrant harbours, and excellent diving. The short distances between anchorages make for relaxed day sailing.</p>

<h3>10. Montenegro</h3>
<p>The Bay of Kotor is one of Europe's most dramatic fjord-like inlets. Montenegro is still relatively undiscovered, offering great value and uncrowded waters.</p>

<h2>Planning Your Trip</h2>
<p>The best sailing season across the Mediterranean runs from May to October, with July and August being the busiest months. Consider shoulder seasons for fewer crowds and better prices. BoatHaven has hundreds of boats available across all these destinations — start planning your 2026 adventure today.</p>`,
    createdAt: new Date("2026-02-20"),
  },
  {
    id: "2",
    title: "First-Time Boat Renter? Everything You Need to Know",
    slug: "first-time-boat-renter-guide",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80&auto=format",
    summary: "A comprehensive guide covering licenses, insurance, what to pack, and how to choose the right boat for your experience level.",
    content: `<h2>Your First Boat Rental: A Complete Guide</h2>
<p>Renting a boat for the first time can feel overwhelming, but with the right preparation it's easier than you think. This guide covers everything from choosing the right vessel to what to pack on board.</p>

<h3>Do You Need a Licence?</h3>
<p>Licence requirements vary by country and boat type. In many Mediterranean countries, boats under a certain engine power can be rented without a licence. However, for sailboats and larger vessels, you'll typically need at least a basic sailing certificate (such as RYA Day Skipper or ICC). If you don't have a licence, don't worry — you can always hire a skipper who will handle the boat while you enjoy the ride.</p>

<h3>Choosing the Right Boat</h3>
<p>Consider these factors when selecting your vessel:</p>
<ul>
<li><strong>Group size:</strong> Make sure the boat has enough capacity and sleeping berths for your party.</li>
<li><strong>Experience level:</strong> If you're a beginner, start with a motorboat or hire a skipper for a sailboat.</li>
<li><strong>Budget:</strong> Prices vary significantly by boat type, season, and location. Day rentals are more affordable than weekly charters.</li>
<li><strong>Activities:</strong> Want to water ski? You'll need a motorboat. Prefer a relaxing cruise? A catamaran offers the most comfort.</li>
</ul>

<h3>What's Usually Included</h3>
<p>Most boat rentals include basic safety equipment (life jackets, fire extinguisher, first aid kit), navigation instruments, and a dinghy. Some include fuel, while others charge separately. Always check the listing details carefully before booking.</p>

<h3>What to Pack</h3>
<p>Pack light and use soft bags instead of hard suitcases — they're much easier to store on board. Essentials include:</p>
<ul>
<li>Sunscreen (SPF 50+) and sunglasses</li>
<li>Non-slip shoes or deck shoes</li>
<li>Light layers for cooler evenings</li>
<li>Waterproof bag for electronics</li>
<li>Motion sickness medication if needed</li>
<li>Snorkelling gear (if not provided)</li>
</ul>

<h3>Insurance &amp; Security Deposit</h3>
<p>Most charter companies include basic insurance, but it's worth checking the excess amount. A security deposit (typically refundable) is standard and can range from a few hundred to several thousand euros depending on the boat's value. Consider purchasing additional damage waiver cover for peace of mind.</p>

<h3>Booking Tips</h3>
<ul>
<li><strong>Book early:</strong> Popular boats and peak-season dates sell out months in advance.</li>
<li><strong>Read reviews:</strong> Previous renters' experiences are invaluable.</li>
<li><strong>Communicate with the owner:</strong> Don't hesitate to ask questions before booking.</li>
<li><strong>Check cancellation policy:</strong> Look for flexible cancellation in case your plans change.</li>
</ul>

<p>Ready to set sail? Browse boats on BoatHaven and find the perfect vessel for your first maritime adventure.</p>`,
    createdAt: new Date("2026-02-10"),
  },
  {
    id: "3",
    title: "Catamaran vs Sailboat: Which One Should You Rent?",
    slug: "catamaran-vs-sailboat-comparison",
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600&q=80&auto=format",
    summary: "We break down the pros and cons of each to help you choose the perfect vessel for your next sailing adventure.",
    content: `<h2>Catamaran vs Sailboat: The Ultimate Comparison</h2>
<p>Choosing between a catamaran and a monohull sailboat is one of the most common dilemmas for boat renters. Both have loyal followers, and the right choice depends on your priorities. Let's break it down.</p>

<h3>Stability &amp; Comfort</h3>
<p><strong>Catamaran wins.</strong> With two hulls, catamarans offer significantly more stability and less heeling (tilting). This makes them ideal for families with children, those prone to seasickness, or anyone who prefers a steadier ride. The flat deck provides more living space, and most catamarans have a spacious salon with panoramic views.</p>
<p>Sailboats heel when sailing upwind, which some find thrilling but others find uncomfortable. The interior is narrower, but many sailors argue this creates a more intimate, authentic sailing experience.</p>

<h3>Space &amp; Layout</h3>
<p><strong>Catamaran wins.</strong> A 42-foot catamaran typically offers as much interior space as a 50-foot monohull. The twin-hull design means cabins are separated for more privacy, and the bridge deck provides additional communal space. The trampoline net at the bow is a favourite spot for sunbathing.</p>
<p>Sailboats make efficient use of their space, with clever storage solutions throughout. However, headroom and beam are inherently more limited.</p>

<h3>Sailing Performance</h3>
<p><strong>Sailboat wins.</strong> Monohull sailboats perform better upwind and offer a more engaging sailing experience. The feeling of the hull cutting through the waves, the responsive helm, and the ability to point closer to the wind are what traditional sailors live for.</p>
<p>Catamarans are faster on a reach (sailing across the wind) but struggle more when sailing directly upwind. They're also harder to tack in tight spaces due to their wider beam.</p>

<h3>Anchoring &amp; Marinas</h3>
<p><strong>Mixed.</strong> Catamarans have a shallower draft, allowing them to anchor closer to shore and access shallow bays that monohulls cannot. However, their wider beam means marina berths are more expensive and sometimes harder to find. Some smaller ports may not accommodate wide catamarans.</p>

<h3>Cost</h3>
<p><strong>Sailboat wins on price.</strong> Catamarans are generally 30-50% more expensive to rent than a comparable-length monohull. However, when you factor in the extra space and cabins, the cost per person can be similar. Marina fees are also higher for catamarans due to their width.</p>

<h3>Our Recommendation</h3>
<table>
<thead><tr><th>Choose a Catamaran if...</th><th>Choose a Sailboat if...</th></tr></thead>
<tbody>
<tr><td>You prioritise comfort and space</td><td>You want the best sailing experience</td></tr>
<tr><td>You have a larger group (6+)</td><td>Budget is a primary concern</td></tr>
<tr><td>Anyone in your group gets seasick</td><td>You plan to visit smaller marinas</td></tr>
<tr><td>You want to anchor in shallow bays</td><td>You're an experienced sailor seeking performance</td></tr>
<tr><td>You're travelling with children</td><td>You enjoy the challenge of upwind sailing</td></tr>
</tbody>
</table>

<p>Whichever you choose, both offer an incredible way to explore the water. Browse catamarans and sailboats on BoatHaven to find your perfect match.</p>`,
    createdAt: new Date("2026-01-28"),
  },
];
