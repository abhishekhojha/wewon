export interface TrustAuthor {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  fallbackImageUrl: string;
}

export interface TrustTestimonial {
  name: string;
  affiliation: string;
  quote: string;
  imageUrl: string | null;
}

export const trustAuthor: TrustAuthor = {
  name: "Aman Mishra",
  role: "🎓 Career Counsellor   |   🏛 IISER Bhopal   |   ⏳ 7+ Years Experience",
  bio: `Aman Mishra is a Director of We Won Academy from Indian Institute of Science Education and Research, Bhopal (IISER Bhopal). I am dedicated Career Counsellor who has been guiding students for the past 7+ years. Through our mentorship, a large number of students have successfully secured admission into top colleges and institutions.\n  \n
👨‍🎓 1 Lakh+ Students Guided   |   📘 200+ Courses`,
  imageUrl: "/avatar/author.jpeg",
  fallbackImageUrl: "/avatar/author.jpeg",
};

export const trustTestimonials: TrustTestimonial[] = [
  {
    name: "Neha Singh",
    affiliation: "JOSAA & CSAB Counselling Program",
    quote:
      "My experience with the We Won Academy JOSAA & CSAB counselling program was excellent. The mentors explained the entire counselling process step by step, including choice filling, mock rounds, and cutoff analysis. Because of their guidance, I was able to make better decisions and avoid common mistakes. I highly recommend this program to every JEE aspirant who wants proper guidance during counselling.",
    imageUrl: null,
  },
  {
    name: "Pallav Pandey",
    affiliation: "UPTAC (HBTU & MMMUT) Counselling Program",
    quote:
      "The UPTAC counselling guidance for HBTU and MMMUT was extremely helpful. The mentors provided detailed college and branch comparisons and helped me understand the best possible options according to my rank. Their strategy for choice filling was very accurate. I am very satisfied with the support and guidance provided.",
    imageUrl: null,
  },
  {
    name: "Raj Malhotra",
    affiliation: "JAC Delhi Counselling Program",
    quote:
      "The JAC Delhi counselling program was one of the best decisions I made. The mentors helped me understand the admission process for colleges like DTU, NSUT, and IIIT-D. They explained seat matrix, reservation rules, and cutoff trends in a very simple way. Their guidance during choice filling and mock analysis gave me a lot of confidence.",
    imageUrl: null,
  },
  {
    name: "Nisha Meena",
    affiliation: "JAC Chandigarh Counselling Program",
    quote:
      "My experience with the JAC Chandigarh counselling mentorship was amazing. The team guided me through every stage, including registration, choice filling, and document verification. They also explained the college comparison and cutoff trends very clearly. The support system was always available whenever I had doubts.",
    imageUrl: null,
  },
  {
    name: "Saksham Agarwal",
    affiliation: "All Combo Counselling Program",
    quote:
      "The All Combo Counselling Program was extremely beneficial because it covered multiple counselling processes like JOSAA, CSAB, JAC Delhi, UPTAC, and more. The mentors provided a complete roadmap and personalized guidance based on my rank and preferences. Their analysis and strategy helped me maximize my chances of getting a good college.",
    imageUrl: null,
  },
];
