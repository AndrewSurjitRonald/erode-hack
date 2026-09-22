import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedQuestion = {
  text: string;
  options: string[];
  textTa: string;
  optionsTa: string[];
  answerIdx: number;
  difficulty: 1 | 2 | 3;
};

const fractions: SeedQuestion[] = [
  { text: "1/2 + 1/4 = ?", options: ["3/4", "1/6", "2/6", "1/8"], textTa: "1/2 + 1/4 = ?", optionsTa: ["3/4", "1/6", "2/6", "1/8"], answerIdx: 0, difficulty: 1 },
  { text: "3/5 - 1/5 = ?", options: ["1/5", "2/5", "4/5", "2/10"], textTa: "3/5 - 1/5 = ?", optionsTa: ["1/5", "2/5", "4/5", "2/10"], answerIdx: 1, difficulty: 1 },
  { text: "Which fraction is equivalent to 2/4?", options: ["2/3", "3/4", "1/2", "1/3"], textTa: "2/4-க்கு சமமான பின்னம் எது?", optionsTa: ["2/3", "3/4", "1/2", "1/3"], answerIdx: 2, difficulty: 1 },
  { text: "1/3 of 9 = ?", options: ["4", "2", "6", "3"], textTa: "9-ன் 1/3 எவ்வளவு?", optionsTa: ["4", "2", "6", "3"], answerIdx: 3, difficulty: 1 },
  { text: "2/3 + 1/6 = ?", options: ["5/6", "3/9", "1/2", "4/6"], textTa: "2/3 + 1/6 = ?", optionsTa: ["5/6", "3/9", "1/2", "4/6"], answerIdx: 0, difficulty: 2 },
  { text: "5/8 - 1/4 = ?", options: ["1/2", "3/4", "3/8", "1/4"], textTa: "5/8 - 1/4 = ?", optionsTa: ["1/2", "3/4", "3/8", "1/4"], answerIdx: 2, difficulty: 2 },
  { text: "Simplify 8/12", options: ["3/4", "2/3", "4/6", "1/2"], textTa: "8/12-ஐ சுருக்குக", optionsTa: ["3/4", "2/3", "4/6", "1/2"], answerIdx: 1, difficulty: 2 },
  { text: "3/4 × 2/5 = ?", options: ["6/9", "2/5", "3/10", "3/5"], textTa: "3/4 × 2/5 = ?", optionsTa: ["6/9", "2/5", "3/10", "3/5"], answerIdx: 2, difficulty: 2 },
  { text: "2 1/2 + 1 3/4 = ?", options: ["4 1/2", "3 3/4", "4", "4 1/4"], textTa: "2 1/2 + 1 3/4 = ?", optionsTa: ["4 1/2", "3 3/4", "4", "4 1/4"], answerIdx: 3, difficulty: 3 },
  { text: "5/6 ÷ 2/3 = ?", options: ["3/4", "5/9", "1 1/4", "2 1/2"], textTa: "5/6 ÷ 2/3 = ?", optionsTa: ["3/4", "5/9", "1 1/4", "2 1/2"], answerIdx: 2, difficulty: 3 },
];

const ratios: SeedQuestion[] = [
  { text: "Simplify the ratio 4:8", options: ["1:2", "2:1", "4:2", "1:4"], textTa: "4:8 விகிதத்தை சுருக்குக", optionsTa: ["1:2", "2:1", "4:2", "1:4"], answerIdx: 0, difficulty: 1 },
  { text: "The ratio of boys to girls is 3:2. If there are 15 boys, how many girls are there?", options: ["12", "10", "9", "15"], textTa: "சிறுவர்கள் மற்றும் சிறுமிகளின் விகிதம் 3:2. 15 சிறுவர்கள் இருந்தால், எத்தனை சிறுமிகள் உள்ளனர்?", optionsTa: ["12", "10", "9", "15"], answerIdx: 1, difficulty: 1 },
  { text: "Write the ratio 6 to 3 in simplest form", options: ["3:1", "1:2", "2:1", "6:3"], textTa: "6:3 விகிதத்தை எளிய வடிவில் எழுதுக", optionsTa: ["3:1", "1:2", "2:1", "6:3"], answerIdx: 2, difficulty: 1 },
  { text: "The ratio 10:5 simplifies to?", options: ["5:10", "1:2", "10:1", "2:1"], textTa: "10:5 விகிதத்தை சுருக்கினால் கிடைப்பது?", optionsTa: ["5:10", "1:2", "10:1", "2:1"], answerIdx: 3, difficulty: 1 },
  { text: "Divide $60 in the ratio 2:3. What is the larger share?", options: ["36", "24", "30", "40"], textTa: "$60-ஐ 2:3 விகிதத்தில் பிரிக்கவும். பெரிய பங்கு எவ்வளவு?", optionsTa: ["36", "24", "30", "40"], answerIdx: 0, difficulty: 2 },
  { text: "Simplify the ratio 15:20", options: ["4:3", "5:4", "3:4", "3:5"], textTa: "15:20 விகிதத்தை சுருக்குக", optionsTa: ["4:3", "5:4", "3:4", "3:5"], answerIdx: 2, difficulty: 2 },
  { text: "If a:b = 2:5 and b = 25, find a.", options: ["12", "8", "15", "10"], textTa: "a:b = 2:5 மற்றும் b = 25 எனில், a-ஐக் கண்டறியவும்.", optionsTa: ["12", "8", "15", "10"], answerIdx: 3, difficulty: 2 },
  { text: "The speed ratio of two cars is 5:4. If the faster car's speed is 100 km/h, find the slower car's speed.", options: ["75", "90", "85", "80"], textTa: "இரு கார்களின் வேக விகிதம் 5:4. வேகமான காரின் வேகம் 100 கிமீ/மணி எனில், மெதுவான காரின் வேகத்தைக் கண்டறியவும்.", optionsTa: ["75", "90", "85", "80"], answerIdx: 3, difficulty: 2 },
  { text: "Three numbers are in ratio 2:3:5 and sum to 100. Find the largest number.", options: ["40", "30", "60", "50"], textTa: "மூன்று எண்கள் 2:3:5 விகிதத்தில் உள்ளன, அவற்றின் கூடுதல் 100. மிகப்பெரிய எண்ணைக் கண்டறியவும்.", optionsTa: ["40", "30", "60", "50"], answerIdx: 3, difficulty: 3 },
  { text: "A mixture has milk and water in ratio 3:1. If the total is 40L, how much water is in it?", options: ["15", "12", "10", "8"], textTa: "ஒரு கலவையில் பால் மற்றும் தண்ணீர் 3:1 விகிதத்தில் உள்ளன. மொத்தம் 40 லிட்டர் எனில், அதில் எத்தனை லிட்டர் தண்ணீர் உள்ளது?", optionsTa: ["15", "12", "10", "8"], answerIdx: 2, difficulty: 3 },
];

const linearEquations: SeedQuestion[] = [
  { text: "Solve for x: x + 5 = 12", options: ["7", "17", "5", "8"], textTa: "x-ஐ தீர்க்கவும்: x + 5 = 12", optionsTa: ["7", "17", "5", "8"], answerIdx: 0, difficulty: 1 },
  { text: "Solve for x: x - 3 = 10", options: ["7", "13", "10", "3"], textTa: "x-ஐ தீர்க்கவும்: x - 3 = 10", optionsTa: ["7", "13", "10", "3"], answerIdx: 1, difficulty: 1 },
  { text: "Solve for x: 2x = 16", options: ["14", "18", "8", "32"], textTa: "x-ஐ தீர்க்கவும்: 2x = 16", optionsTa: ["14", "18", "8", "32"], answerIdx: 2, difficulty: 1 },
  { text: "Solve for x: x/3 = 4", options: ["7", "9", "1", "12"], textTa: "x-ஐ தீர்க்கவும்: x/3 = 4", optionsTa: ["7", "9", "1", "12"], answerIdx: 3, difficulty: 1 },
  { text: "Solve for x: 3x + 2 = 14", options: ["4", "5", "3", "6"], textTa: "x-ஐ தீர்க்கவும்: 3x + 2 = 14", optionsTa: ["4", "5", "3", "6"], answerIdx: 0, difficulty: 2 },
  { text: "Solve for x: 2x - 5 = 9", options: ["6", "8", "7", "9"], textTa: "x-ஐ தீர்க்கவும்: 2x - 5 = 9", optionsTa: ["6", "8", "7", "9"], answerIdx: 2, difficulty: 2 },
  { text: "Solve for x: 5(x - 2) = 15", options: ["7", "3", "6", "5"], textTa: "x-ஐ தீர்க்கவும்: 5(x - 2) = 15", optionsTa: ["7", "3", "6", "5"], answerIdx: 3, difficulty: 2 },
  { text: "Solve for x: x/2 + 3 = 7", options: ["10", "6", "4", "8"], textTa: "x-ஐ தீர்க்கவும்: x/2 + 3 = 7", optionsTa: ["10", "6", "4", "8"], answerIdx: 3, difficulty: 2 },
  { text: "Solve for x: 2x + 3 = x + 9", options: ["5", "3", "9", "6"], textTa: "x-ஐ தீர்க்கவும்: 2x + 3 = x + 9", optionsTa: ["5", "3", "9", "6"], answerIdx: 3, difficulty: 3 },
  { text: "Solve for x: 3(x + 1) = 2(x + 4)", options: ["4", "6", "3", "5"], textTa: "x-ஐ தீர்க்கவும்: 3(x + 1) = 2(x + 4)", optionsTa: ["4", "6", "3", "5"], answerIdx: 3, difficulty: 3 },
];

const percentages: SeedQuestion[] = [
  { text: "What is 50% of 200?", options: ["100", "50", "150", "200"], textTa: "200-ன் 50% எவ்வளவு?", optionsTa: ["100", "50", "150", "200"], answerIdx: 0, difficulty: 1 },
  { text: "Convert 1/4 to a percent", options: ["40%", "20%", "25%", "75%"], textTa: "1/4-ஐ சதவீதமாக மாற்றுக", optionsTa: ["40%", "20%", "25%", "75%"], answerIdx: 2, difficulty: 1 },
  { text: "What is 10% of 90?", options: ["10", "90", "19", "9"], textTa: "90-ன் 10% எவ்வளவு?", optionsTa: ["10", "90", "19", "9"], answerIdx: 3, difficulty: 1 },
  { text: "Convert 0.75 to a percent", options: ["7.5%", "750%", "57%", "75%"], textTa: "0.75-ஐ சதவீதமாக மாற்றுக", optionsTa: ["7.5%", "750%", "57%", "75%"], answerIdx: 3, difficulty: 1 },
  { text: "What is 20% of 150?", options: ["25", "30", "35", "20"], textTa: "150-ன் 20% எவ்வளவு?", optionsTa: ["25", "30", "35", "20"], answerIdx: 1, difficulty: 2 },
  { text: "A shirt costs $80 and is discounted by 25%. What is the sale price?", options: ["55", "65", "70", "60"], textTa: "ஒரு சட்டையின் விலை $80, அதற்கு 25% தள்ளுபடி கொடுக்கப்படுகிறது. விற்பனை விலை என்ன?", optionsTa: ["55", "65", "70", "60"], answerIdx: 3, difficulty: 2 },
  { text: "45 is what percent of 180?", options: ["20%", "25%", "30%", "40%"], textTa: "45, 180-ல் எத்தனை சதவீதம்?", optionsTa: ["20%", "25%", "30%", "40%"], answerIdx: 1, difficulty: 2 },
  { text: "Increase 50 by 20%", options: ["55", "65", "70", "60"], textTa: "50-ஐ 20% அதிகரிக்கவும்", optionsTa: ["55", "65", "70", "60"], answerIdx: 3, difficulty: 2 },
  { text: "A price increased from $80 to $100. What is the percentage increase?", options: ["20%", "30%", "15%", "25%"], textTa: "ஒரு விலை $80-லிருந்து $100 ஆக உயர்ந்தது. சதவீத அதிகரிப்பு என்ன?", optionsTa: ["20%", "30%", "15%", "25%"], answerIdx: 3, difficulty: 3 },
  { text: "In a class of 40 students, 60% are girls. How many boys are there?", options: ["24", "20", "18", "16"], textTa: "40 மாணவர்கள் கொண்ட வகுப்பில், 60% சிறுமிகள். எத்தனை சிறுவர்கள் உள்ளனர்?", optionsTa: ["24", "20", "18", "16"], answerIdx: 3, difficulty: 3 },
];

async function main() {
  const topicData: { name: string; nameTa: string; questions: SeedQuestion[] }[] = [
    { name: "Fractions", nameTa: "பின்னங்கள்", questions: fractions },
    { name: "Ratios", nameTa: "விகிதங்கள்", questions: ratios },
    { name: "Linear Equations", nameTa: "நேரியல் சமன்பாடுகள்", questions: linearEquations },
    { name: "Percentages", nameTa: "சதவீதம்", questions: percentages },
  ];

  for (const t of topicData) {
    const existing = await prisma.topic.findFirst({ where: { name: t.name } });
    if (existing) {
      if (!existing.nameTa) {
        await prisma.topic.update({ where: { id: existing.id }, data: { nameTa: t.nameTa } });
      }
      for (const q of t.questions) {
        await prisma.question.updateMany({
          where: { topicId: existing.id, text: q.text, textTa: "" },
          data: { textTa: q.textTa, optionsTa: q.optionsTa },
        });
      }
      console.log(`Skipping ${t.name} creation — already seeded (backfilled Tamil translations)`);
      continue;
    }

    const topic = await prisma.topic.create({ data: { name: t.name, nameTa: t.nameTa } });
    await prisma.question.createMany({
      data: t.questions.map((q) => ({
        topicId: topic.id,
        text: q.text,
        options: q.options,
        textTa: q.textTa,
        optionsTa: q.optionsTa,
        answerIdx: q.answerIdx,
        difficulty: q.difficulty,
      })),
    });
    console.log(`Seeded ${t.questions.length} questions for ${t.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
