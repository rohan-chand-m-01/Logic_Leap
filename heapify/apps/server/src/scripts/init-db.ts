import { Pool } from "pg";
import { env } from "../config/env";

const pool = new Pool({ connectionString: env.DATABASE_URL });

const schema = `
  CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    institution_id UUID REFERENCES institutions(id),
    registration_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    institution_id UUID REFERENCES institutions(id)
  );

  CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    institution_id UUID REFERENCES institutions(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50),
    target VARCHAR(50),
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP,
    institution_id UUID REFERENCES institutions(id)
  );

  CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    subject_id UUID REFERENCES subjects(id),
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id),
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    needs_substitute BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending',
    affected_classes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS substitute_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_id UUID REFERENCES leave_requests(id),
    subject_id UUID REFERENCES subjects(id),
    section_id UUID REFERENCES sections(id),
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    assigned_teacher_id UUID REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id),
    subject_id UUID REFERENCES subjects(id),
    title VARCHAR(255) NOT NULL,
    total_score INT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES tests(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50),
    options JSONB,
    correct_answer TEXT,
    topic_tag VARCHAR(255),
    difficulty VARCHAR(50)
  );

  CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES tests(id),
    student_id UUID REFERENCES users(id),
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS timetable_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day VARCHAR(10) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    subject_id UUID REFERENCES subjects(id),
    section_id UUID REFERENCES sections(id),
    teacher_id UUID REFERENCES users(id),
    room VARCHAR(50),
    locked BOOLEAN DEFAULT false
  );

  CREATE TABLE IF NOT EXISTS ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    subject_id UUID REFERENCES subjects(id),
    topic VARCHAR(255),
    mode VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS risk_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    message_id VARCHAR(255) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS preprep_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id),
    subject_id UUID REFERENCES subjects(id),
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject_id UUID REFERENCES subjects(id),
    section_id UUID REFERENCES sections(id),
    chapter VARCHAR(255),
    topic VARCHAR(255),
    is_current_syllabus BOOLEAN DEFAULT false,
    indexed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

async function seedData() {
  // Check if data already exists
  const existing = await pool.query(`SELECT COUNT(*) as count FROM users`);
  if (Number(existing.rows[0].count) > 0) {
    console.log("Data already seeded, skipping seed step.");
    return;
  }

  // Create institution
  const instRes = await pool.query(
    `INSERT INTO institutions (name, code, address) VALUES ('Heapify Institute of Technology', 'HIT', '123 Innovation Drive, Bangalore') RETURNING id`
  );
  const instId = instRes.rows[0].id;

  // Create subjects
  const subjectNames = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'];
  const subjectIds: string[] = [];
  for (const name of subjectNames) {
    const res = await pool.query(
      `INSERT INTO subjects (name, institution_id) VALUES ($1, $2) RETURNING id`, [name, instId]
    );
    subjectIds.push(res.rows[0].id);
  }

  // Create sections
  const sectionNames = ['CS-A', 'CS-B'];
  const sectionIds: string[] = [];
  for (const name of sectionNames) {
    const res = await pool.query(
      `INSERT INTO sections (name, institution_id) VALUES ($1, $2) RETURNING id`, [name, instId]
    );
    sectionIds.push(res.rows[0].id);
  }

  // bcrypt hash for "Admin@1234"
  const defaultHash = "$2b$10$8K1p/a0dL1LXMIgoEDFrwOBqMcfH5.yHACKED000000000000000000";

  // Create admin user
  await pool.query(
    `INSERT INTO users (email, password_hash, role, full_name, institution_id, registration_complete)
     VALUES ('admin@heapify.edu', $1, 'admin', 'Dr. Principal Kumar', $2, true)`,
    [defaultHash, instId]
  );

  // Create teacher users
  const teacherNames = ['Dr. Arjun Mehta', 'Prof. Mira Patel', 'Dr. Leena Roy', 'Prof. Vikram Singh', 'Dr. Priya Sharma'];
  const teacherIds: string[] = [];
  for (let i = 0; i < teacherNames.length; i++) {
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name, institution_id, registration_complete)
       VALUES ($1, $2, 'teacher', $3, $4, true) RETURNING id`,
      [`teacher${i + 1}@heapify.edu`, defaultHash, teacherNames[i], instId]
    );
    teacherIds.push(res.rows[0].id);
  }

  // Create student users
  const studentNames = [
    'Aarav Sharma', 'Riya Gupta', 'Arjun Patel', 'Sneha Reddy', 'Rohan Kumar',
    'Priya Nair', 'Kabir Malhotra', 'Ananya Joshi', 'Vivek Iyer', 'Meera Das',
    'Aryan Singh', 'Ishita Verma', 'Dev Chandra', 'Kavya Rao', 'Nikhil Bose',
    'Tanya Kapoor', 'Siddharth Menon', 'Pooja Agarwal', 'Rahul Deshpande', 'Neha Tiwari'
  ];
  const studentIds: string[] = [];
  for (let i = 0; i < studentNames.length; i++) {
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name, institution_id, registration_complete)
       VALUES ($1, $2, 'student', $3, $4, true) RETURNING id`,
      [`student${i + 1}@heapify.edu`, defaultHash, studentNames[i], instId]
    );
    studentIds.push(res.rows[0].id);
  }

  // Create attendance logs (past 30 days)
  const today = new Date();
  for (const studentId of studentIds) {
    for (let day = 1; day <= 28; day++) {
      const date = new Date(today.getTime() - day * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      // Pick 2-3 subjects per day
      const subjectsForDay = subjectIds.slice(0, 3);
      for (const subjectId of subjectsForDay) {
        const rand = Math.random();
        const status = rand < 0.15 ? 'absent' : rand < 0.22 ? 'late' : 'present';
        await pool.query(
          `INSERT INTO attendance_logs (student_id, subject_id, date, status) VALUES ($1, $2, $3, $4)`,
          [studentId, subjectId, dateStr, status]
        );
      }
    }
  }

  // Create tests
  const testData = [
    { title: 'Algebra Formative', subjectIdx: 0, total: 50 },
    { title: 'Quadratics Drill', subjectIdx: 0, total: 50 },
    { title: 'Kinematics Weekly', subjectIdx: 1, total: 50 },
    { title: 'Organic Chemistry Quiz', subjectIdx: 2, total: 40 },
  ];
  const testIds: string[] = [];
  for (const t of testData) {
    const res = await pool.query(
      `INSERT INTO tests (teacher_id, subject_id, title, total_score, status)
       VALUES ($1, $2, $3, $4, 'published') RETURNING id`,
      [teacherIds[0], subjectIds[t.subjectIdx], t.title, t.total]
    );
    testIds.push(res.rows[0].id);
  }

  // Create test questions
  const questions = [
    { testIdx: 0, text: 'Solve x^2 + 5x + 6 = 0', type: 'mcq', options: ['(-2,-3)', '(2,3)', '(-1,-6)', '(1,6)'], answer: '(-2,-3)', topic: 'Quadratics', difficulty: 'medium' },
    { testIdx: 0, text: 'What is the discriminant of x^2 - 4x + 4?', type: 'mcq', options: ['0', '4', '8', '-4'], answer: '0', topic: 'Quadratics', difficulty: 'easy' },
    { testIdx: 2, text: 'Unit of acceleration is?', type: 'mcq', options: ['m/s', 'm/s^2', 'N', 'kg'], answer: 'm/s^2', topic: 'Units', difficulty: 'easy' },
    { testIdx: 2, text: 'Velocity can be negative.', type: 'true_false', options: null, answer: 'true', topic: 'Vectors', difficulty: 'easy' },
  ];
  for (const q of questions) {
    await pool.query(
      `INSERT INTO test_questions (test_id, question_text, question_type, options, correct_answer, topic_tag, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [testIds[q.testIdx], q.text, q.type, q.options ? JSON.stringify(q.options) : null, q.answer, q.topic, q.difficulty]
    );
  }

  // Create test results for completed tests
  for (const studentId of studentIds) {
    for (let t = 0; t < 2; t++) {
      const score = 20 + Math.floor(Math.random() * 30);
      await pool.query(
        `INSERT INTO test_results (test_id, student_id, score) VALUES ($1, $2, $3)`,
        [testIds[t], studentId, score]
      );
    }
  }

  // Create timetable slots
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00'];
  for (const day of days) {
    for (let slot = 0; slot < timeSlots.length; slot++) {
      for (let sec = 0; sec < sectionIds.length; sec++) {
        const subjectIdx = (slot + sec) % subjectIds.length;
        const teacherIdx = subjectIdx % teacherIds.length;
        await pool.query(
          `INSERT INTO timetable_slots (day, time_slot, subject_id, section_id, teacher_id, room, locked)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [day, timeSlots[slot], subjectIds[subjectIdx], sectionIds[sec], teacherIds[teacherIdx], `Room ${100 + slot + 1}`, slot === 0]
        );
      }
    }
  }

  // Create AI sessions
  for (let i = 0; i < 15; i++) {
    const studentIdx = i % studentIds.length;
    const subjectIdx = i % subjectIds.length;
    const created = new Date(today.getTime() - (i * 2 + 1) * 86400000);
    await pool.query(
      `INSERT INTO ai_sessions (student_id, subject_id, topic, mode, created_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [studentIds[studentIdx], subjectIds[subjectIdx], `Topic ${i + 1}`, i % 2 === 0 ? 'practice' : 'doubt', created.toISOString(), i < 13 ? created.toISOString() : null]
    );
  }

  // Create events
  const eventData = [
    { title: 'Mid-Semester Exam', desc: 'Mid-semester examinations begin', type: 'Exam', starts: 14 },
    { title: 'Tech Fest 2026', desc: 'Annual technology festival', type: 'Cultural', starts: 21 },
    { title: 'Republic Day Holiday', desc: 'National holiday', type: 'Holiday', starts: 30 },
  ];
  for (const ev of eventData) {
    const startsAt = new Date(today.getTime() + ev.starts * 86400000);
    await pool.query(
      `INSERT INTO events (title, description, event_type, target, starts_at, institution_id)
       VALUES ($1, $2, $3, 'Everyone', $4, $5)`,
      [ev.title, ev.desc, ev.type, startsAt.toISOString(), instId]
    );
  }

  // Create a leave request
  await pool.query(
    `INSERT INTO leave_requests (teacher_id, leave_type, start_date, end_date, reason, needs_substitute, status, affected_classes)
     VALUES ($1, 'sick', $2, $3, 'Medical appointment', true, 'pending', 3)`,
    [teacherIds[1], new Date(today.getTime() + 86400000).toISOString().split('T')[0], new Date(today.getTime() + 2 * 86400000).toISOString().split('T')[0]]
  );

  console.log("Successfully seeded comprehensive data.");
}

async function run() {
  console.log("Initializing database tables...");
  try {
    await pool.query(schema);
    console.log("Successfully created all tables.");
    await seedData();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  } finally {
    await pool.end();
  }
}

run();
