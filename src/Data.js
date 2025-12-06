// src/data.js

// ICON NAMES ONLY
// You will import the actual icons inside the component where you need them.

export const events = [
  {
    id: 1,
    imageUrl: "MVP/images/eventImages/Emmaus.png",
    title: "Emmaus Experience",
    startDateDisplay: "Wed, 10 Dec 2025",
    endDateDisplay: "Sun, 14 Dec 2025",
    timeRange: "4:00 PM – 8:00 PM",
    location: "Destiny Missions Global Assembly, 96b Ewet Housing Estate, Uyo",
    startDay: "10",
    endDay: "14",
    year: "2025",
    month: "Dec",
    description:
      "A spiritual gathering focused on celebrating the year's blessings. Join us for an evening of worship, fellowship, and a message of hope.",
  },
  {
    id: 2,
    imageUrl: "MVP/images/eventImages/Emmaus.png",
    title: "Youth Ablaze Conference",
    startDateDisplay: "Wed, 22 Nov 2025",
    endDateDisplay: "Wed, 22 Nov 2025",
    timeRange: "9:00 AM – 3:00 PM",
    location: "Youth Hall",
    startDay: "22",
    endDay: "22",
    year: "2025",
    month: "Nov",
    description:
      "An energizing full-day conference designed to empower young leaders. Featuring motivational speakers, workshops, and live music.",
  },
  {
    id: 3,
    imageUrl: "MVP/images/eventImages/Emmaus.png",
    title: "Christmas Carol Service",
    startDateDisplay: "Mon, 01 Dec 2025",
    endDateDisplay: "Mon, 01 Dec 2025",
    timeRange: "6:00 PM",
    location: "Main Sanctuary",
    startDay: "01",
    endDay: "01",
    year: "2025",
    month: "DEC",
    description:
      "Ring in the holiday season with our traditional Christmas Carol Service. Enjoy classic hymns, choir performances, and a candlelit atmosphere.",
  },
];

// TESTIMONIES
export const testimonies = [
  {
    image: "/images/userPlaceHolder.jpg",
    title: "From Addiction to Freedom",
    author: "— Sarah K., Lagos",
    text: "I was lost in drugs for 7 years before finding hope in Christ at Destiny Mission Global Assembly...",
    fullText:
      "I was lost in drugs for 7 years before finding hope in Christ at Destiny Mission Global Assembly. Through prayer and the Word, God set me free and restored my life completely.",
  },
  {
    image: "/images/userPlaceHolder.jpg",
    title: "Marriage Restored",
    author: "— John & Mary A., Abuja",
    text: "Our marriage was falling apart until we attended the Couples Retreat...",
    fullText:
      "Our marriage was falling apart until we attended the Couples Retreat. God brought healing and unity, and today we are stronger than ever.",
  },
  {
    image: "/images/userPlaceHolder.jpg",
    title: "Miraculous Healing",
    author: "— Grace O., Port Harcourt",
    text: "When doctors gave up on my child, God proved His power...",
    fullText:
      "When doctors gave up on my child, God proved His power through healing during the church's Healing Service. My child is now completely healthy!",
  },
  {
    image: "/images/userPlaceHolder.jpg",
    title: "Financial Breakthrough",
    author: "— Michael T., Ibadan",
    text: "After years of financial struggle, God opened doors I never imagined...",
    fullText:
      "After years of financial struggle, God opened doors I never imagined possible through the teachings at DMGA.",
  },
  {
    image: "/images/userPlaceHolder.jpg",
    title: "Deliverance from Depression",
    author: "— Joy M., Enugu",
    text: "I was in a dark place for months, but prayers from the church family...",
    fullText:
      "I was in a dark place for months, but the prayers and support from the church brought me into the light. I am now filled with joy and purpose.",
  },
  {
    image: "/images/userPlaceHolder.jpg",
    title: "Career Transformation",
    author: "— David P., Kano",
    text: "After losing my job, I thought all was lost. But God opened a new door...",
    fullText:
      "After losing my job, God used the church's career ministry to open a better opportunity than I imagined.",
  },
];

// GALLERY IMAGES
export const galleryImages = Array.from({ length: 24 }).map((_, i) => ({
  src: `/MVP/images/gallery2/gImage${i + 1}.jpg`,
  caption: "Annual Harvest Crusade",
}));

galleryImages[0].caption = "Sunday Worship Service";
galleryImages[1].caption = "Youth Ablaze Conference";
galleryImages[2].caption = "Water Baptism";
galleryImages[3].caption = "Community Outreach";
galleryImages[4].caption = "All-Night Prayer";
galleryImages[5].caption = "Christmas Carol Service";

// PROGRAMMES
export const programmes = [
  {
    title: "Worship & Praise",
    description:
      "Experience powerful worship that ushers in God's presence and transforms hearts",
    icon: "FaMusic",
    schedule: ["Sunday Services", "Special Events", "Choir Practice"],
  },
  {
    title: "Bible Study",
    description: "Deep diving into God's Word to build strong foundations of faith",
    icon: "FaBook",
    schedule: ["Wednesday Bible Study", "Small Groups", "Online Study"],
  },
  {
    title: "Youth Ministry",
    description:
      "Empowering the next generation to walk in their purpose and fulfill their destiny",
    icon: "FaUsers",
    schedule: ["Youth Service", "Youth Camps", "Mentorship Programs"],
  },
  {
    title: "Prayer & Intercession",
    description:
      "Corporate prayer sessions that bring breakthrough and move the hand of God",
    icon: "FaMessageCircle",
    schedule: ["Early Morning Prayers", "Prayer Vigils", "Prayer Chain"],
  },
  {
    title: "Community Outreach",
    description: "Touching lives in our community through acts of love and service",
    icon: "LuHandHelping",
    schedule: ["Food Distribution", "Hospital Visits", "Community Events"],
  },
  {
    title: "Discipleship",
    description: "Mentoring and equipping believers to grow in Christ",
    icon: "LuChurch",
    schedule: ["New Believers Class", "Leadership Training", "Mentoring"],
  },
  {
    title: "Children's Ministry",
    description: "Nurturing young hearts to know and love Jesus",
    icon: "TbMoodKid",
    schedule: ["Sunday School", "Vacation Bible School", "Children's Church"],
  },
  {
    title: "Women's Ministry",
    description:
      "Empowering women to discover their identity in Christ and fulfill their purpose",
    icon: "MdWoman",
    schedule: ["Women's Fellowship", "Bible Study", "Conferences"],
  },
  {
    title: "Men's Ministry",
    description: "Raising godly men who lead with integrity and strength",
    icon: "MdMan",
    schedule: ["Men's Fellowship", "Accountability Groups", "Retreats"],
  },
];

// WEEKLY SCHEDULE
export const weeklySchedule = [
  {
    title: "Sunday Worship Service",
    date: "Every Sunday",
    time: "9:00 AM - 12:00 PM",
    location: "Main Sanctuary",
    description:
      "Join us for powerful worship, life-changing messages, and fellowship",
  },
  {
    title: "Midweek Bible Study",
    date: "Every Wednesday",
    time: "6:00 PM - 8:00 PM",
    location: "Fellowship Hall",
    description:
      "Deep dive into God's Word and grow in your understanding",
  },
  {
    title: "Prayer Vigil",
    date: "First Friday of Every Month",
    time: "10:00 PM - 2:00 AM",
    location: "Prayer Room",
    description:
      "Corporate prayer and intercession for breakthrough",
  },
  {
    title: "Youth Night",
    date: "Every Saturday",
    time: "5:00 PM - 7:00 PM",
    location: "Youth Center",
    description:
      "Fun, fellowship, and faith-building activities for young people",
  },
];

// SPECIAL EVENTS
export const specialEvents = [
  {
    title: "Annual Conference",
    description:
      "Three days of powerful teaching, worship, and impartation",
    icon: "TbBuildingCircus",
  },
  {
    title: "Community Outreach",
    description:
      "Reaching out to our community with the love of Christ",
    icon: "LuHandHelping",
  },
  {
    title: "Family Fun Day",
    description: "A day of fun activities and fellowship for the whole family",
    icon: "TbConfetti",
  },
  {
    title: "Leadership Summit",
    description:
      "Equipping and empowering leaders for effective ministry",
    icon: "TbCalendarStar",
  },
];

export const recentTestimonies = testimonies.slice(0, 3);
export const recentGalleryImages = galleryImages.slice(0, 7);

export const YOUTUBE_CHANNEL_ID = "UCH3uj1-ubXiKKhj4WZskflw";
