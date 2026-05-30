import { Teacher, DanceClass, PaymentCard } from './types';

export const TEACHERS: Teacher[] = [
  {
    id: 't1',
    name: 'Senish',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tags: ['Hiphop Expert', 'Choreography', '10 Years Teaching'],
    rating: 5.0,
    description: 'PLANA Hiphop technique lead. Winner of multiple domestic street dance battles. High energy and perfect for foundations.',
  },
  {
    id: 't2',
    name: '拾柒',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    tags: ['Jazz Diva', 'Sensual Style', 'Stage Perfomer'],
    rating: 4.9,
    description: 'Jazz dance master, known for fluid body isolation and expressive performance. Over 60,000 online video views.',
  },
  {
    id: 't3',
    name: 'MORNI',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    tags: ['Kids Dance', 'Street Dance Class', 'Patient coach'],
    rating: 4.8,
    description: 'Focuses on building rhythm, coordination, and confidence for junior students and complete beginners. Super approachable!',
  },
  {
    id: 't4',
    name: '小樱',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    tags: ['Jazz Funk', 'Kpop Style', 'Detail Focused'],
    rating: 5.0,
    description: 'Specializes in high-tempo Jazz-Funk and latest Kpop charts. Very patient, takes time to clean up everybody\'s details.',
  },
  {
    id: 't5',
    name: '馒头',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    tags: ['Old School Hiphop', 'Bounce & Groove', 'Battle Judge'],
    rating: 4.9,
    description: 'Authentic 90s Hiphop instructor. Focuses on groove, bounce control, and freestyle confidence.',
  },
  {
    id: 't6',
    name: 'Sewli',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    tags: ['Lyrical Jazz', 'Body Flow', 'Stretching Care'],
    rating: 4.7,
    description: 'Blends contemporary elegance into jazz logic. Ideal for improving gracefulness, posture, and core control.',
  },
  {
    id: 't7',
    name: '顺顺',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    tags: ['Urban Choreo', 'Musicality', 'Visual Form'],
    rating: 4.9,
    description: 'Urban choreography master. Teaches dancers how to feel visual grids, hit exact sound cues, and capture camera attention.',
  },
  {
    id: 't8',
    name: 'CHAIN',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    tags: ['Hip-Jazz', 'High Heels', 'Vibe Stylist'],
    rating: 4.8,
    description: 'Brings high confidence and deep sassy vibes to the table. Teaches lines, posture and performance logic.',
  },
  {
    id: 't9',
    name: 'Liu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tags: ['House Dance', 'Footwork Master', 'Stamina Training'],
    rating: 4.9,
    description: 'House footwork expert, passionate about rhythm cycles and active cardiovascular training. Be ready to sweat!',
  },
  {
    id: 't10',
    name: '心蕊',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    tags: ['Contemporary Jazz', 'Core Control', 'Emotion Expression'],
    rating: 4.8,
    description: 'Guides students through emotional storytelling via body movement and contemporary balance training.',
  },
  {
    id: 't11',
    name: '小禾',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    tags: ['Commercial Jazz', 'Showcase Trainer', 'Sharp Clean'],
    rating: 5.0,
    description: 'Specializes in clean lines, fast transitions, and stage showcases. Perfecting the visual sync of group choreography.',
  }
];

export const CLASSES_TEMPLATE: Omit<DanceClass, 'date'>[] = [
  // 团课 (Group)
  {
    id: 'template_01_hiphop_g1',
    title: '街道口基训',
    genre: 'hiphop',
    difficulty: 2,
    teacher: TEACHERS[0], // Senish
    timestart: '13:00',
    timeend: '14:00',
    classroom: 'A教室',
    minpeople: 5,
    bookedcount: 25,
    maxcount: 30,
    type: 'group'
  },
  {
    id: 'template_02_jazz_g1',
    title: '街道口基训',
    genre: 'jazz',
    difficulty: 2,
    teacher: TEACHERS[1], // 拾柒
    timestart: '14:00',
    timeend: '15:00',
    classroom: 'A教室',
    minpeople: 5,
    bookedcount: 18,
    maxcount: 30,
    type: 'group'
  },
  {
    id: 'template_03_jazz_g2',
    title: '街道口零基础JAZZ',
    genre: 'jazz',
    difficulty: 1,
    teacher: TEACHERS[1], // 拾柒
    timestart: '15:00',
    timeend: '16:20',
    classroom: 'A教室',
    minpeople: 5,
    bookedcount: 22,
    maxcount: 30,
    type: 'group'
  },
  {
    id: 'template_04_hiphop_g2',
    title: '街道口零基础hiphop',
    genre: 'hiphop',
    difficulty: 1,
    teacher: TEACHERS[4], // 馒头
    timestart: '16:30',
    timeend: '17:50',
    classroom: 'A教室',
    minpeople: 5,
    bookedcount: 14,
    maxcount: 30,
    type: 'group'
  },
  {
    id: 'template_05_jazz_g3',
    title: '街道口零基础JAZZ',
    genre: 'jazz',
    difficulty: 1,
    teacher: TEACHERS[3], // 小樱
    timestart: '15:00',
    timeend: '16:20',
    classroom: 'A教室',
    minpeople: 5,
    bookedcount: 1,
    maxcount: 30,
    type: 'group'
  },
  {
    id: 'template_06_urban_g1',
    title: '街道口零基础hiphop',
    genre: 'hiphop',
    difficulty: 1,
    teacher: TEACHERS[4], // 馒头
    timestart: '15:00',
    timeend: '16:20',
    classroom: 'A教室',
    minpeople: 5,
    bookedcount: 2,
    maxcount: 30,
    type: 'group'
  },
  {
    id: 'template_07_choreo_g1',
    title: '街道口基训',
    genre: 'urban',
    difficulty: 3,
    teacher: TEACHERS[6], // 顺顺
    timestart: '16:30',
    timeend: '17:50',
    classroom: 'B教室',
    minpeople: 5,
    bookedcount: 29,
    maxcount: 30,
    type: 'group'
  },
  
  // 班课 (Series / Small group / Bootcamps)
  {
    id: 'template_series_01',
    title: '少儿爵士',
    genre: 'jazz',
    difficulty: 2,
    teacher: TEACHERS[2], // MORNI
    timestart: '10:30',
    timeend: '12:00',
    classroom: '少儿爵士1班',
    minpeople: 3,
    bookedcount: 6,
    maxcount: 15,
    type: 'series'
  },
  {
    id: 'template_series_02',
    title: '少儿爵士',
    genre: 'jazz',
    difficulty: 2,
    teacher: TEACHERS[2], // MORNI
    timestart: '14:00',
    timeend: '15:30',
    classroom: '少儿爵士1班',
    minpeople: 3,
    bookedcount: 8,
    maxcount: 15,
    type: 'series'
  },
  {
    id: 'template_series_03',
    title: '少儿爵士',
    genre: 'jazz',
    difficulty: 3,
    teacher: TEACHERS[3], // 小樱
    timestart: '18:30',
    timeend: '20:00',
    classroom: '少儿爵士B班',
    minpeople: 3,
    bookedcount: 12,
    maxcount: 15,
    type: 'series'
  },
  {
    id: 'template_series_04',
    title: 'JAZZ/HIPHOP小班集训',
    genre: 'jazz',
    difficulty: 4,
    teacher: TEACHERS[0], // Senish
    timestart: '13:00',
    timeend: '15:00',
    classroom: 'B教室',
    minpeople: 4,
    bookedcount: 8,
    maxcount: 8, // Fully booked! Standard queue button
    type: 'series'
  },

  // 私教 (Private Class / Studio Rent)
  {
    id: 'template_private_01',
    title: '租教室 / 1对1私教课',
    genre: 'contemporary',
    difficulty: 3,
    teacher: TEACHERS[5], // Sewli (we will represent her)
    timestart: '16:00',
    timeend: '18:00',
    classroom: 'C教室',
    minpeople: 1,
    bookedcount: 0,
    maxcount: 1,
    type: 'private'
  },
  {
    id: 'template_private_02',
    title: '租教室 / 1对1私教课',
    genre: 'contemporary',
    difficulty: 4,
    teacher: TEACHERS[9], // Liu
    timestart: '18:30',
    timeend: '20:30',
    classroom: 'C教室',
    minpeople: 1,
    bookedcount: 1,
    maxcount: 1, // Booked out
    type: 'private'
  }
];

export const generateClasses = (): DanceClass[] => {
  const result: DanceClass[] = [];
  const dates = [
    '2026-05-24', // Sat
    '2026-05-25', // Sun (today)
    '2026-05-26', // Mon
    '2026-05-27', // Tue
    '2026-05-28', // Wed
    '2026-05-29', // Thu
    '2026-05-30', // Fri
    '2026-05-31', // Sat
    '2026-06-01', // Mon
    '2026-06-02'  // Tue
  ];

  dates.forEach((dateStr) => {
    CLASSES_TEMPLATE.forEach((tmpl) => {
      // Modify bookedcount slightly for variety across days
      let bookedcount = tmpl.bookedcount;
      if (dateStr > '2026-05-25') {
        bookedcount = Math.floor(Math.random() * (tmpl.maxcount - 1));
      }

      // Generate randomized pre-populated reservedspots based on bookedcount
      const allSpots = [];
      const rows = ['A', 'B', 'C', 'D', 'E'];
      for (const row of rows) {
        for (let col = 1; col <= 6; col++) {
          allSpots.push(`${row}${col}`);
        }
      }
      const shuffledSpots = [...allSpots].sort(() => 0.5 - Math.random());
      const reservedspots = shuffledSpots.slice(0, bookedcount);

      // Future bookings on May 26/27 onwards might display opening time rules in the screenshots, e.g., "05月24日 00:00可约"
      let openbookingtime: string | undefined = undefined;
      if (dateStr > '2026-05-27') {
        openbookingtime = '05月26日 00:00可约';
      }

      result.push({
        ...tmpl,
        id: `${tmpl.id}_${dateStr}`,
        bookedcount,
        openbookingtime,
        date: dateStr,
        reservedspots
      });
    });
  });

  return result;
};

export const PAYMENT_CARDS: PaymentCard[] = [
  {
    id: 'c1',
    title: '体验课单次卡 (Single Pass)',
    price: 39,
    originalprice: 120,
    passes: 1,
    validdays: 15,
    description: '限首次到店新学员体验。任意团课全场可用，开启你的舞蹈旅程！',
    badge: '新人福利'
  },
  {
    id: 'c2',
    title: '10次团课周卡 (10 Classes Pack)',
    price: 399,
    originalprice: 800,
    passes: 10,
    validdays: 60,
    description: '老学员高性价比自修卡，高自由度，2个月有效期。',
    badge: '热销推荐'
  },
  {
    id: 'c3',
    title: '30次精英通卡 (30 Classes Elite)',
    price: 999,
    originalprice: 1800,
    passes: 30,
    validdays: 120,
    description: '中高级舞者进阶卡，适用于所有通卡团课与进阶集训营。',
    badge: '中阶必备'
  },
  {
    id: 'c4',
    title: '无限尊享月卡 (Unlimited Month)',
    price: 699,
    passes: -1, // -1 means unlimited
    validdays: 30,
    description: 'PLANA无限次狂舞卡！30天内所有通卡团课无限次预约上课。',
    badge: '无限狂舞'
  },
  {
    id: 'c5',
    title: '少儿尊享季卡 (Kids Special Quarter)',
    price: 1599,
    passes: 24,
    validdays: 90,
    description: '少儿专属培优班课，共24次精品定制教学课时，打牢宝贝体型。',
    badge: '少儿班专享'
  }
];

export const MOCK_NOTICES = [
  '📣 5月26日 20:00 特邀韩舞导师小樱进行 K-Pop 经典回归单曲教学速成课！',
  '📣 [防疫通告] 每节课后教室全面紫外线消杀，入场请配合出示健康打卡！',
  '📣 PLANA六周年店庆狂欢！充值课程包均加赠2次自习卡，超值巨惠进行中！'
];

export const MOCK_BANNERS = [
  {
    id: 'b1',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=80',
    title: '夏季爵士爆发营 (Summer Jazz Bootcamp)',
    subtitle: '让汗水见证蜕变 • 最强师资加盟'
  },
  {
    id: 'b2',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    title: '零基础街舞成长计划',
    subtitle: '10周从零入门，成就酷炫街舞达人'
  },
  {
    id: 'b3',
    image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800&auto=format&fit=crop&q=80',
    title: '大师私享课 & 双人特训',
    subtitle: '突破瓶颈，极速精进律动和质感'
  }
];

export const MOCK_VIDEOS = [
  {
    id: 'v1',
    title: 'Senish老师 极致Hiphop控制流《Bounce Back》现场返图',
    plays: '12.4k',
    likes: '890',
    cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
    duration: '02:15'
  },
  {
    id: 'v2',
    title: '拾柒 | 极致妩媚高跟鞋Jazz 《Gimme More》精选结课秀',
    plays: '8.9k',
    likes: '620',
    cover: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&auto=format&fit=crop&q=80',
    duration: '01:50'
  }
];
