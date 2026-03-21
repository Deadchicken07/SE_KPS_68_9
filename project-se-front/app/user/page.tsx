"use client";

import AppointmentSolution from "@/components/home/AppointmentSolution";
import Contact from "@/components/home/Contact";
import HeroBanner from "@/components/home/HeroBanner";
import Information from "@/components/home/Information";
import Tips from "@/components/home/Tips";

const heroSlides = [
  {
    title: "คลินิกสุขภาพจิตที่เข้าใจทุกหัวใจ",
    description:
      "ดูแลสุขภาพใจอย่างครบวงจร ด้วยทีมจิตแพทย์ นักจิตวิทยา และนักบำบัดที่พร้อมดูแลทุกช่วงวัย",
    image: "/user/hero-01.svg",
    badge: "Mental Wellness Center",
  },
  {
    title: "พื้นที่ปลอดภัยสำหรับการพูดคุยและฟื้นฟู",
    description:
      "รองรับทั้งการปรึกษาด้วยตนเอง การปรึกษาแทนญาติ หรือการพูดคุยแบบออนไลน์อย่างเป็นส่วนตัว",
    image: "/user/hero-02.svg",
    badge: "Private Consultation",
  },
  {
    title: "บริการทันสมัยในบรรยากาศอบอุ่น",
    description:
      "ออกแบบประสบการณ์การดูแลแบบคลินิกสมัยใหม่ ด้วยขั้นตอนชัดเจน เดินทางสะดวก และทีมงานที่เข้าถึงง่าย",
    image: "/user/hero-03.svg",
    badge: "Trusted Care",
  },
];

const services = [
  {
    title: "จิตเวชทั่วไป",
    body: "ดูแลภาวะซึมเศร้า แพนิค ความเครียด วิตกกังวล และอาการนอนไม่หลับ ด้วยแผนการรักษาที่เหมาะกับแต่ละคน",
  },
  {
    title: "จิตเวชเด็กและวัยรุ่น",
    body: "รองรับปัญหาพัฒนาการ สมาธิสั้น การเรียน การใช้หน้าจอ และพฤติกรรมที่ต้องการการดูแลอย่างใกล้ชิด",
  },
  {
    title: "จิตเวชผู้สูงอายุ",
    body: "ประเมินอารมณ์ ความจำ และพฤติกรรมเปลี่ยนแปลง เพื่อช่วยให้ผู้สูงอายุและครอบครัวรับมือได้ดีขึ้น",
  },
  {
    title: "ให้คำปรึกษาและจิตบำบัด",
    body: "เปิดพื้นที่สำหรับการจัดการปัญหาชีวิต ความสัมพันธ์ ครอบครัว การงาน และการฟื้นฟูสภาพใจในระยะยาว",
  },
  {
    title: "ปัญหาการเสพติด",
    body: "ดูแลภาวะติดสารเสพติด ติดพนัน และพฤติกรรมเสพติดอื่น ๆ แบบต่อเนื่องโดยผู้เชี่ยวชาญเฉพาะทาง",
  },
  {
    title: "ทดสอบทางจิตวิทยา",
    body: "ประเมินสุขภาพจิต ความสามารถ และภาวะต่าง ๆ เพื่อช่วยวางแผนการดูแลหรือประกอบการรักษาอย่างเป็นระบบ",
  },
];


const articles = [
  "โรคแพนิค (Panic Disorder) คืออะไร?",
  "ภาวะบุคลิกภาพแปรปรวน คืออะไร",
  "เครียดขนาดไหน ควรปรึกษาจิตแพทย์",
];

const articleImages = [
  "/user/article-01.svg",
  "/user/article-02.svg",
  "/user/article-03.svg",
];

const stats = [
  { label: "ดูแลครบทุกช่วงวัย", value: "เด็ก - ผู้สูงอายุ" },
  { label: "รูปแบบการรักษา", value: "พูดคุย ปรึกษา จ่ายยา" },
  { label: "เวลาทำการ", value: "ทุกวัน 9.00 - 18.00" },
];

export default function UserPage() {
  return (
    <main className="min-h-screen text-slate-800">
      <HeroBanner slides={heroSlides} stats={stats}/>
      <Information services={services}/>
      <AppointmentSolution/>
      <Tips articles={articles} articleImages={articleImages}/>
      <Contact/>
    </main>
  );
}
