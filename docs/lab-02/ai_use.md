# Lab 2 AI Use and Reflection

ในการทำงาน Lab 2 ครั้งนี้ ผมได้ใช้งาน **Antigravity** AI Coding Agent ผ่านบัญชี Google Cloud Platform  
โดยเลือกใช้โมเดลหลักคือ **Claude Sonnet 4.6 (Thinking)** และ **Gemini 3.6 Flash**

---

## Selected Key Prompts

| # | Prompt Name | Actual Prompt Text | My Reflection |
|---|---|---|---|
| 1 | การสรุป Requirements และวางแผน Sprint 2 | ช่วยสรุป requirements ทั้งหมดของ Lab 2 จากไฟล์ `Lab_02_labsheet.md` โดยเน้น: (1) Business Rules และ Acceptance Criteria สำคัญ (2) ช่วยแบ่งเอกสารสเปกเป็น `specification.md`, `api-spec.md` และ `ui-spec.md` (3) แตก User Stories เป็น 7 Issues เพื่อเอาไปใส่ใน GitHub Project Board | AI สรุปข้อมูลและแยกประเด็นสำคัญได้ดี ทำให้เข้าใจ requirements ทั้งหมดและวางแผนงานแต่ละ Issue ได้ชัดเจนก่อนเริ่มเขียนโค้ดจริง |
| 2 | การออกแบบ Database Schema และความสัมพันธ์ของตาราง | ช่วยออกแบบ Prisma Schema สำหรับระบบตั๋ว Lab 2 หน่อย และอยากรู้ว่าความสัมพันธ์ระหว่าง Ticket กับ Attachment ทำไมเราถึงควรใช้ `onDelete: Restrict` แทนที่จะเป็น `Cascade` ถ้าลบตั๋วจะมีผลกระทบอะไรมั้ย | เข้าใจเรื่อง Referential Integrity ว่าการใช้ Restrict ช่วยป้องกันไม่ให้ข้อมูลประวัติหรือไฟล์แนบถูกลบหายไปโดยไม่ตั้งใจ ซึ่งเหมาะกับระบบที่ต้องการเก็บ Audit Trail |
| 3 | การสร้าง Ticket Number และ Sequence Rollover | อยากรู้วิธี generate เลขตั๋วรูปแบบ `TKT-YYYY-NNNNNN` ถ้ามีคนกดส่ง ticket พร้อมกันจะเจอปัญหาเลขซ้ำกันมั้ย (Race Condition) แล้วถ้าขึ้นปีใหม่เราจะ reset เลข sequence กลับมาเริ่มที่ 1 อัตโนมัติด้วย Prisma Transaction ยังไง | เข้าใจปัญหาเรื่อง Race Condition เมื่อมีคำขอเข้ามาพร้อมกัน และได้เรียนรู้วิธีใช้ Database Transaction ในการอัปเดต counter แบบ atomic ซึ่งปลอดภัยกว่าการนับจำนวนแถวธรรมดา |
| 4 | การแก้ปัญหา Pagination ไม่นิ่งด้วย Secondary Sort (Tiebreaker) | ปัญหาตัว orderBy ใน `GET /api/tickets` ที่เรียงด้วย createdAt อย่างเดียวอาจทำให้ pagination มีปัญหาถ้ามี ticket ที่เวลาสร้างเท่ากัน ช่วยอธิบายหน่อยว่าทำไมข้อมูลถึงอาจจะข้ามหน้าหรือซ้ำได้ และต้องแก้โค้ดใส่ `ticketNumber DESC` เป็นตัวช่วยเรียงลำดับยังไง | เข้าใจว่า database ไม่รับประกันลำดับของข้อมูลถ้าค่าที่ใช้ sort มันซ้ำกัน (Tie) การเพิ่ม secondary sort เข้าไปช่วยให้การเปลี่ยนหน้า (pagination) แสดงผลเสถียร ไม่กระโดดข้าม |
| 5 | ระบบ Attachment และการทำ Soft-Delete | ช่วยอธิบายหน่อยว่าทำไมระบบนี้ถึงเลือกใช้ Soft-Delete แทนการลบไฟล์ทิ้งจริง ๆ จาก database และช่วยเขียนโค้ดระบบอัปโหลดไฟล์แนบที่: (1) รับเฉพาะไฟล์ JPG, PNG, WEBP, PDF ขนาดไม่เกิน 5 MB (2) ห้ามเกิน 5 ไฟล์ต่อ ticket (3) ตอนลบให้มี Modal บังคับกรอกเหตุผลการลบด้วย | เข้าใจแนวคิดเรื่อง Audit Trail ว่าการเก็บประวัติและเหตุผลการลบไว้มีประโยชน์ต่อการตรวจสอบย้อนหลัง และช่วยให้ฟังก์ชันการลบไฟล์มีความโปร่งใสและปลอดภัยมากขึ้น |
| 6 | การปรับ Navbar ให้ Responsive บนมือถือ | ตัว responsive ของ nav bar บนจอมือถือยังมีปัญหา element มันเบียดอัดกันจนล้นจอ ช่วยแก้ `NavBar.tsx` ให้เป็น Hamburger Menu ที่พอกดแล้วเลื่อนเมนูลงมา (Drawer) ให้อ่านง่ายและกดง่ายบนมือถือหน่อย | เข้าใจการใช้ Breakpoint ของ Tailwind CSS และการจัดการ State เมนูเปิด-ปิด ทำให้แถบ Navbar บนมือถือดูสะอาดตา ปุ่มกดง่าย (Touch Target ไม่เล็กเกินไป) และไม่ล้นจอ |
| 7 | ความแตกต่างระหว่าง Vitest กับ Playwright | อยากรู้ว่า tool ตัวไหนที่ test แล้วแคปรูปหน้าจอให้ได้ แล้ว Vitest กับ Playwright ต่างกันยังไง ทำไม Vitest ถึงวัด responsive layout กับแคปภาพหน้าจอจริงไม่ได้เหมือน Playwright | เข้าใจความแตกต่างว่า Vitest รันบน JSDOM (จำลองใน Node.js) จึงไม่มีหน้าจอจริง ส่วน Playwright เปิดเบราว์เซอร์ Chromium จริง ๆ ขึ้นมาเรนเดอร์ จึงสามารถเช็คการแสดงผล responsive และแคปภาพหน้าจอออกมาได้ |
| 8 | การเขียน End-to-End Test ด้วย Playwright | ช่วยเขียน test E2E ด้วย Playwright ที่ครอบคลุม flow การใช้งานของ Requester ทั้ง 7 ข้อ (E2E-01 ถึง E2E-07) ตั้งแต่เลือก Requester, สร้าง ticket, ค้นหากับกรองข้อมูล, pagination, จัดการไฟล์แนบ, จนถึงเช็คว่าถ้าแอบเข้า ticket ของคนอื่นจะต้องติด 403 Forbidden | การเขียน automated test ด้วย Playwright ช่วยให้เห็นการทำงานของระบบตั้งแต่หน้าบ้านไปจนถึงหลังบ้านจริง ๆ ช่วยดักจับ bug ได้ดี และไม่ต้องคอยกดเทสเองซ้ำ ๆ ทุกครั้งที่แก้โค้ด |

---

## Overall Reflection

ในการทำงาน Lab 2 นี้ ขอบเขตของงานมีความซับซ้อนขึ้นกว่า Lab 1 โดยเป็นการพัฒนา **Requester Ticketing MVP** เต็มรูปแบบ ครอบคลุมตั้งแต่การวาง Data Model, การจัดทำระบบ Business Logic ที่ซับซ้อน, การสร้างหน้าบ้านด้วย Tailwind CSS ในธีม Zen Green, ไปจนถึงการเขียน Automated Test ทั้งระดับ Unit Test, Integration Test, และ End-to-End Test ด้วย Playwright
ซึ่งอีกสิ่งที่ได้เรียนรู้คือการที่เราเขียนตัว spec ที่ชัดเจนไว้สำหรับใช้งาน AI Agent ซึ่งจากการทำงานผมรู้สึกว่า AI Agent ทำงานได้ดีขึ้นมาก ไม่ทำงานนอกกรอบ เนื่องจากเรากำหนดขอบเขตต่าง ๆ ไว้ให้เรียบร้อย ทำให้ตัวระบบมีความเสถียร ทั้งฐานข้อมูล หน้าบ้าน และหลังบ้าน

ผมได้ใช้งาน **Antigravity (Claude Sonnet 4.6 & Gemini 3.6 Flash)** ทั้งในรูปแบบ **ถาม-ตอบ (Interactive Q&A)** เพื่อทำความเข้าใจ tools ต่าง ๆ และแนวคิดเบื้องต้น และในรูปแบบ **Autonomous Agent Mode** เพื่อช่วยเขียนโค้ด และรันชุดทดสอบ

> [!NOTE]
> **หมายเหตุการจัดทำเอกสาร:** เนื้อหาและการสะท้อนความคิดเห็นในเอกสารนี้มาจากประสบการณ์และการลงมือปฏิบัติจริงของผมทั้งหมด โดยได้ใช้ **AI Agent ช่วยเรียบเรียงประโยคและจัดรูปแบบ Markdown (Re-formatting & Polishing)** เพื่อให้เอกสารมีความถูกต้อง
