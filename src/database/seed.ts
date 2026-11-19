import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Part, PartSchema } from '../parts/schemas/part.schema.js';
import { Unit, UnitSchema } from '../units/schemas/unit.schema.js';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema.js';
import { Day, DaySchema } from '../days/schemas/day.schema.js';
import { Phase, PhaseSchema } from '../phases/schemas/phase.schema.js';
import { Step, StepSchema } from '../steps/schemas/step.schema.js';
import { PhaseType } from '../phases/enums/phase.enum.js';
import { StepLayoutType } from '../steps/enums/step.enum.js';

function getMongoUri(): string {
    if (process.env.MONGO_URL) {
        return process.env.MONGO_URL;
    }
    // Fallback: parse .env manually if not populated
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            for (const line of envContent.split('\n')) {
                const trimmed = line.trim();
                if (trimmed.startsWith('MONGO_URL')) {
                    const match = trimmed.match(/^MONGO_URL\s*=\s*["']?([^"']+)["']?/);
                    if (match && match[1]) {
                        return match[1].trim();
                    }
                }
            }
        }
    } catch (err) {
        console.warn('Could not read .env file directly:', err);
    }
    throw new Error('MONGO_URL is not set in environment or .env file');
}

export async function seedDatabase() {
    const mongoUri = getMongoUri();
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully to MongoDB.');

    const PartModel = mongoose.model<Part>(Part.name, PartSchema);
    const UnitModel = mongoose.model<Unit>(Unit.name, UnitSchema);
    const LessonModel = mongoose.model<Lesson>(Lesson.name, LessonSchema);
    const DayModel = mongoose.model<Day>(Day.name, DaySchema);
    const PhaseModel = mongoose.model<Phase>(Phase.name, PhaseSchema);
    const StepModel = mongoose.model<Step>(Step.name, StepSchema);

    console.log('\n--- Seeding Educational Content (Parts, Units, Lessons, Days, Phases, Steps) ---');

    // 1. PARTS (2 objects)
    const part1Data = {
        partNameAr: 'الجزء الأول: أحكام النون الساكنة والتنوين',
        partNameEn: 'Part 1: Rules of Noon Sakinah and Tanween',
    };
    let part1 = await PartModel.findOne({ partNameAr: part1Data.partNameAr });
    if (!part1) {
        part1 = await PartModel.create(part1Data);
        console.log(`[Created Part 1]: ${part1.partNameAr} (${part1._id})`);
    } else {
        console.log(`[Found Part 1]: ${part1.partNameAr} (${part1._id})`);
    }

    const part2Data = {
        partNameAr: 'الجزء الثاني: أحكام الميم الساكنة والميم والنون المشددتين',
        partNameEn: 'Part 2: Rules of Meem Sakinah and Doubled Letters',
    };
    let part2 = await PartModel.findOne({ partNameAr: part2Data.partNameAr });
    if (!part2) {
        part2 = await PartModel.create(part2Data);
        console.log(`[Created Part 2]: ${part2.partNameAr} (${part2._id})`);
    } else {
        console.log(`[Found Part 2]: ${part2.partNameAr} (${part2._id})`);
    }

    // 2. UNITS (2 objects linked to Part 1)
    const unit1Data = {
        hintAr: 'مقدمة وتفصيل حكم الإظهار الحلقي وحروفه الستة في القرآن الكريم',
        hintEn: 'Introduction and details of Throat Manifestation (Izhar Halqi) and its 6 letters',
        labelAr: 'الوحدة الأولى: الإظهار الحلقي',
        labelEn: 'Unit 1: Throat Manifestation (Izhar Halqi)',
        partId: part1._id,
    };
    let unit1 = await UnitModel.findOne({ labelAr: unit1Data.labelAr, partId: part1._id });
    if (!unit1) {
        unit1 = await UnitModel.create(unit1Data);
        console.log(`[Created Unit 1]: ${unit1.labelAr} (${unit1._id})`);
    } else {
        console.log(`[Found Unit 1]: ${unit1.labelAr} (${unit1._id})`);
    }

    const unit2Data = {
        hintAr: 'شرح أحكام الإدغام بقسميه: الإدغام بغنة والإدغام بغير غنة',
        hintEn: 'Explanation of Assimilation (Idgham) with and without nasalization',
        labelAr: 'الوحدة الثانية: الإدغام',
        labelEn: 'Unit 2: Assimilation (Idgham)',
        partId: part1._id,
    };
    let unit2 = await UnitModel.findOne({ labelAr: unit2Data.labelAr, partId: part1._id });
    if (!unit2) {
        unit2 = await UnitModel.create(unit2Data);
        console.log(`[Created Unit 2]: ${unit2.labelAr} (${unit2._id})`);
    } else {
        console.log(`[Found Unit 2]: ${unit2.labelAr} (${unit2._id})`);
    }

    // 3. LESSONS (2 objects linked to Unit 1)
    const lesson1Data = {
        nameAr: 'الدرس الأول: مفهوم الإظهار وحرفا الهمزة والهاء',
        nameEn: 'Lesson 1: Concept of Izhar and Letters Hamza & Ha',
        days: 3,
        unitId: unit1._id,
    };
    let lesson1 = await LessonModel.findOne({ nameAr: lesson1Data.nameAr, unitId: unit1._id });
    if (!lesson1) {
        lesson1 = await LessonModel.create(lesson1Data);
        console.log(`[Created Lesson 1]: ${lesson1.nameAr} (${lesson1._id})`);
    } else {
        console.log(`[Found Lesson 1]: ${lesson1.nameAr} (${lesson1._id})`);
    }

    const lesson2Data = {
        nameAr: 'الدرس الثاني: باقي حروف الحلق (العين والحاء والغين والخاء)',
        nameEn: 'Lesson 2: Remaining Throat Letters (Ayn, Ha, Ghayn, Kha)',
        days: 4,
        unitId: unit1._id,
    };
    let lesson2 = await LessonModel.findOne({ nameAr: lesson2Data.nameAr, unitId: unit1._id });
    if (!lesson2) {
        lesson2 = await LessonModel.create(lesson2Data);
        console.log(`[Created Lesson 2]: ${lesson2.nameAr} (${lesson2._id})`);
    } else {
        console.log(`[Found Lesson 2]: ${lesson2.nameAr} (${lesson2._id})`);
    }

    // 4. DAYS (2 objects linked to Lesson 1)
    const day1Data = {
        nameAr: 'اليوم الأول: مقدمة ومفهوم الإظهار الحلقي',
        nameEn: 'Day 1: Introduction and Concept of Izhar Halqi',
        headerTextAr: 'تعرف على معنى الإظهار الحلقي ومخرجه الصوتي',
        headerTextEn: 'Learn the meaning of Izhar Halqi and its articulation point',
        purpose: 'استيعاب مفهوم الإظهار والتمييز بين النون المظهرة وغيرها',
        expectedTime: 25,
        lessonId: lesson1._id,
    };
    let day1 = await DayModel.findOne({ nameAr: day1Data.nameAr, lessonId: lesson1._id });
    if (!day1) {
        day1 = await DayModel.create(day1Data);
        console.log(`[Created Day 1]: ${day1.nameAr} (${day1._id})`);
    } else {
        console.log(`[Found Day 1]: ${day1.nameAr} (${day1._id})`);
    }

    const day2Data = {
        nameAr: 'اليوم الثاني: التطبيق العملي على الهمزة والهاء',
        nameEn: 'Day 2: Practical Application on Hamza and Ha',
        headerTextAr: 'أمثلة تطبيقية من القرآن الكريم على حرفي الهمزة والهاء',
        headerTextEn: 'Practical Quranic examples on letters Hamza and Ha',
        purpose: 'إتقان نطق النون الساكنة والتنوين عند ملاقاة الهمزة والهاء',
        expectedTime: 30,
        lessonId: lesson1._id,
    };
    let day2 = await DayModel.findOne({ nameAr: day2Data.nameAr, lessonId: lesson1._id });
    if (!day2) {
        day2 = await DayModel.create(day2Data);
        console.log(`[Created Day 2]: ${day2.nameAr} (${day2._id})`);
    } else {
        console.log(`[Found Day 2]: ${day2.nameAr} (${day2._id})`);
    }

    // 5. PHASES (2 objects linked to Day 1)
    const phase1Data = {
        type: PhaseType.LEARNING,
        descriptionAr: 'مرحلة التعلم النظري والشرح التفاعلي لقاعدة الإظهار الحلقي',
        descriptionEn: 'Theoretical learning and interactive explanation phase of Izhar Halqi rule',
        dayId: day1._id,
    };
    let phase1 = await PhaseModel.findOne({ type: phase1Data.type, dayId: day1._id });
    if (!phase1) {
        phase1 = await PhaseModel.create(phase1Data);
        console.log(`[Created Phase 1]: ${phase1.type} (${phase1._id})`);
    } else {
        console.log(`[Found Phase 1]: ${phase1.type} (${phase1._id})`);
    }

    const phase2Data = {
        type: PhaseType.EXAMPLES,
        descriptionAr: 'مرحلة الاستماع للأمثلة الصوتية المرتلة وتحديد مواضع الحكم',
        descriptionEn: 'Audio recitation examples and rule location identification phase',
        dayId: day1._id,
    };
    let phase2 = await PhaseModel.findOne({ type: phase2Data.type, dayId: day1._id });
    if (!phase2) {
        phase2 = await PhaseModel.create(phase2Data);
        console.log(`[Created Phase 2]: ${phase2.type} (${phase2._id})`);
    } else {
        console.log(`[Found Phase 2]: ${phase2.type} (${phase2._id})`);
    }

    // 6. STEPS (2 objects linked to Phase 1)
    const step1Data = {
        descriptionAr: 'شرح مخرج حروف الحلق مع النون الساكنة والتنوين',
        descriptionEn: 'Explanation of throat articulation points with Noon Sakinah and Tanween',
        type: 'lesson_presentation',
        layoutType: StepLayoutType.GRID_2,
        data: {
            title: 'مخرج الإظهار الحلقي',
            definition: 'الإظهار لغةً هو البيان، واصطلاحاً هو إخراج كل حرف من مخرجه من غير غنة زائدة.',
            throatSections: [
                { name: 'أقصى الحلق', letters: ['ء', 'هـ'] },
                { name: 'وسط الحلق', letters: ['ع', 'ح'] },
                { name: 'أدنى الحلق', letters: ['غ', 'خ'] },
            ],
            audioSample: 'https://cdn.alwadih.com/audio/izhar_intro.mp3',
        },
        phaseId: phase1._id,
    };
    let step1 = await StepModel.findOne({ descriptionAr: step1Data.descriptionAr, phaseId: phase1._id });
    if (!step1) {
        step1 = await StepModel.create(step1Data);
        console.log(`[Created Step 1]: ${step1.descriptionAr} (${step1._id})`);
    } else {
        console.log(`[Found Step 1]: ${step1.descriptionAr} (${step1._id})`);
    }

    const step2Data = {
        descriptionAr: 'مقارنة صوتية وتفاعلية بين النون المظهرة والنون المخفاة',
        descriptionEn: 'Audio and interactive comparison between manifest Noon and concealed Noon',
        type: 'interactive_quiz',
        layoutType: StepLayoutType.GRID_4,
        data: {
            questionAr: 'استمع للكلمة التالية وحدد الحكم الصحيح: (مَنْ آمَنَ)',
            questionEn: 'Listen to the word and choose the correct rule: (Man Amana)',
            audioUrl: 'https://cdn.alwadih.com/audio/man_amana.mp3',
            options: [
                { id: '1', text: 'إظهار حلقي', isCorrect: true },
                { id: '2', text: 'إدغام بغنة', isCorrect: false },
                { id: '3', text: 'إقلاب', isCorrect: false },
                { id: '4', text: 'إخفاء حقيقي', isCorrect: false },
            ],
            feedbackSuccess: 'أحسنت! جاءت الهمزة بعد النون الساكنة وهو حكم الإظهار الحلقي.',
        },
        phaseId: phase1._id,
    };
    let step2 = await StepModel.findOne({ descriptionAr: step2Data.descriptionAr, phaseId: phase1._id });
    if (!step2) {
        step2 = await StepModel.create(step2Data);
        console.log(`[Created Step 2]: ${step2.descriptionAr} (${step2._id})`);
    } else {
        console.log(`[Found Step 2]: ${step2.descriptionAr} (${step2._id})`);
    }

    console.log('\n--- Seeding Completed Successfully! ---');
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
}

// Execute when run directly
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('seed')) {
    seedDatabase().catch((err) => {
        console.error('Seeding error:', err);
        process.exit(1);
    });
}
