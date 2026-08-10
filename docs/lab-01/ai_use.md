# Lab 1 AI Use and Reflection

ในการทำงานครั้งนี้ ผมได้ใช้งาน **Antigravity** AI Coding Agent ผ่านบัญชี Google Cloud Platform  
โดยเลือกใช้โมเดลหลักคือ **Claude Sonnet 4.6 (Thinking)** และ **Gemini 3.6 Flash** 

---

## Selected Key Prompts

| # | Prompt Name | Actual Prompt Text | My Reflection |
|---|---|---|---|
| 1 | สรุปเนื้อหาของ Lab 1 | สรุปเนื้อหาของ Lab1_Labsheet.md โดยเน้น: (1) requirements ที่ต้องทำอย่างละเอียด (2) ข้อกำหนดและข้อจำกัดสำคัญ (3) เครื่องมือที่ใช้ | AI สรุปข้อมูลจากไฟล์ได้ดีและแยกประเด็นสำคัญชัดเจน แต่ต้องระบุรูปแบบผลลัพธ์เพิ่ม เช่น Markdown Table หรือ List เพื่อให้อ่านง่ายขึ้น |
| 2 | Git Workflow และ Branch Structure | อธิบาย Git Workflow และ Best Practices สำหรับ branch: main, lab1-staging, feature/1-4 ครอบคลุมลำดับการแตก branch การ commit และเส้นทางการ merge | AI อธิบายเป็นขั้นตอนชัดเจน ครอบคลุมทุก branch ตั้งแต่การแตก feature branch จาก staging จนถึงการ merge กลับสู่ staging |
| 3 | Setup Project Foundation | ช่วยสอนการ Setup โครงสร้าง Project Foundation โดยอ้างอิงจากไฟล์ Lab1_Labsheet.md ขอให้อธิบายเป็นขั้นตอน แต่ละขั้นประกอบด้วย: (1) Command ที่ต้องรัน (2) จุดประสงค์ของคำสั่ง (3) ผลลัพธ์ที่ได้ เช่น ไฟล์หรือโฟลเดอร์ที่ถูกสร้างขึ้น | AI อธิบายเป็นขั้นตอนชัดเจน พร้อมรายละเอียดครบถ้วน ทำให้เข้าใจโครงสร้าง project และหน้าที่ของแต่ละ command ได้ดี |
| 4 | Setup Prisma และ Database | ช่วย setup Prisma ใน project นี้ โดย: (1) สร้าง Category model ใน schema.prisma ตาม spec ใน Lab1_Labsheet.md (2) รัน migration เพื่อสร้าง table ใน PostgreSQL (3) สร้าง seed.ts ที่ insert 4 categories หลังจากทำแต่ละขั้นตอนแล้ว ขอให้อธิบายด้วยว่า: ไฟล์ที่สร้างขึ้นมีหน้าที่อะไร คำสั่งที่รันทำงานอย่างไร และทำไมถึงเลือกใช้วิธีนี้ | AI สร้าง schema, migration และ seed ได้ถูกต้อง และอธิบายแต่ละขั้นตอนได้ชัดเจน เช่น อธิบายว่าทำไมต้องใช้ upsert แทน insert ธรรมดา ทำให้เข้าใจหลักการทำงานของ Prisma ไปด้วยในตัว |
| 5 | Integration vs Unit test | "อยากรู้ว่าทำไม categories.test.ts ถึงไม่จำลอง app มาเองแต่ดึงมาจาก index.ts" | เข้าใจว่า `health.test.ts` = Unit Test (ไม่ต้อง DB), `categories.test.ts` = Integration Test (ต้อง DB จริง) |
| 6 | Setup Docker สำหรับ PostgreSQL | ช่วย setup Docker สำหรับ project นี้ โดยสร้าง docker-compose.yml เพื่อรัน PostgreSQL และอธิบายด้วยว่า: ทำไมถึงต้องใช้ Docker แทนการติดตั้ง PostgreSQL โดยตรง แต่ละ config ใน docker-compose.yml มีความหมายและหน้าที่อะไร และ command ที่ใช้รัน/หยุด container คืออะไร | AI สร้าง docker-compose.yml และอธิบายได้ชัดเจนว่า Docker ช่วยให้ทีมทุกคนใช้ environment เดียวกันได้โดยไม่ต้องติดตั้ง PostgreSQL เองในเครื่อง |
| 7 | การใช้งาน CORS ใน Express | ทำไม Express backend ถึงต้องมีการ setup CORS และทำไม frontend ถึง fetch ข้อมูลไม่ได้ถ้าไม่มี CORS ช่วยอธิบายว่า CORS คืออะไร ทำงานอย่างไร และการ config `origin: 'http://localhost:5173'` ใน project หมายถึงอะไร | AI อธิบายได้ชัดเจนว่า browser จะ block request ที่ข้าม origin โดยอัตโนมัติ และ CORS header เป็นวิธีบอก browser ว่า server อนุญาตให้ origin นั้น access ได้ |
| 8 | ช่วยเขียน UI ใน App.tsx | ช่วยเขียน React component ใน App.tsx สำหรับ TokTickIT โดยมี: (1) ปุ่ม [Check System] ที่เมื่อกดแล้วเรียก GET /api/health และ GET /api/categories (2) แสดง loading state ระหว่างรอข้อมูล (3) แสดง category list เมื่อสำเร็จ (4) แสดง error message เมื่อ API ล้มเหลว และหลังเขียนเสร็จให้อธิบายว่า useState แต่ละตัวทำหน้าที่อะไร | AI สร้าง UI ได้ครบถ้วนตาม spec |
| 9 | ช่วยเขียน test ใน App.test.tsx | ช่วยเขียน Vitest test สำหรับ App.tsx ให้ครบ 3 test : UI-01 (heading renders), UI-02 (category list แสดงหลัง click), UI-03 (error message เมื่อ API ล้มเหลว) และหลังเขียนเสร็จให้อธิบายแต่ละ test แบบละเอียดว่า mock fetch อย่างไร ทำไมต้องใช้ waitFor และ fireEvent ทำงานอย่างไร | AI เขียน test ได้ครบ 3 ข้อและอธิบายได้ชัดเจน ทำให้เข้าใจความแตกต่างระหว่าง `mockResolvedValueOnce` กับ `mockRejectedValueOnce` และเหตุผลที่ต้องใช้ `afterEach(() => vi.unstubAllGlobals())` เพื่อป้องกัน mock รั่วไปกระทบ test อื่น |
| 10 | ช่วยสร้างโครงสร้าง Markdown สำหรับไฟล์ reviewer.md และ ai_use.md | ช่วยสร้างโครงสร้าง Markdown สำหรับ reviewer.md ที่ใช้บันทึก Peer Review ของ Lab 1 โดยต้องครอบคลุม: (1) ข้อมูลของตนเอง (2) ข้อมูล reviewer (3) PR ที่ถูก review พร้อม comment และ response (4) PR ที่ตนเองไป review ให้คนอื่น ให้ใช้ Markdown table เพื่อให้อ่านง่าย | AI สร้างโครงสร้างได้ครบถ้วน และเป็นระเบียบ สร้างเป็นรูปแบบ table แยกแต่ละ section ชัดเจน ไม่ต้องคิดโครงสร้างเอง สามารถเข้าไปกรอกข้อมูลได้เลย |

---

## Overall Reflection

ในการทำงานครั้งนี้ได้ใช้ AI (Gemini Antigravity) ด้วย Model **Claude Sonnet 4.6 (Thinking)** ซึ่งในการใช้งานผมจะใช้อยู่ 2 แบบคือการใช้ในรูปแบบ **ถาม-ตอบ** และรูปแบบ **Agent** เนื่องจากผมไม่ได้มีประสบการณ์สำหรับการทำ Website มีความรู้พื้นฐานนิดหน่อย ซึ่งยังไม่พอสำหรับการทำงาน Lab ในครั้งนี้ ส่วนใหญ่จึงใช้ AI ในรูปแบบในการช่วยสอนทำ เนื่องจากผมต้องการที่จะรู้ถึงกระบวนการ และจุดประสงค์ต่าง ๆ ของการทำงาน ไม่ว่าจะเป็นการ Setup Project, การเขียน Code, การทำ Git และการทำ Test ทำให้ผมสามารถทำงาน Lab ในครั้งนี้ได้ดียิ่งขึ้น

ในงานบางส่วนผมเลือกที่จะใช้ **AI Agent** เนื่องจากเป็นการประหยัดเวลาในการทำงาน เช่น การจัดเตรียมโครงสร้างไฟล์ Markdown, การช่วยสร้างโค้ดเริ่มต้น หรือการรันคำสั่งทดสอบระบบ ซึ่งหลังจากการทำงานทุกครั้ง ผมจะให้ AI อธิบายสิ่งที่ AI ทำทั้งหมดอย่างละเอียด เพื่อให้ผมสามารถเข้าใจโครงสร้างและตรรกะของโค้ด และสามารถอธิบายต่อหรือนำไปประยุกต์ใช้ได้ด้วยตนเอง

**สิ่งที่ AI ทำได้ดี (Strengths & Benefits):**  
* **ช่วยลดเวลาในการ Setup Environment:** การตั้งค่า Docker (`docker-compose.yml`), Prisma ORM และการตั้งค่า CORS ทำได้อย่างรวดเร็วและถูกต้อง
* **อธิบายแนวคิดที่ซับซ้อนให้เข้าใจง่าย:** AI ช่วยอธิบายข้อแตกต่างระหว่าง Unit Test (`health.test.ts`) กับ Integration Test (`categories.test.ts`), การทำงานของ `async/await` และหลักการของ CORS 
* **ช่วยสร้างโครงสร้างเอกสารและ Test Cases:** สามารถสร้าง Vitest และ Supertest รวมถึงการจัดตาราง Markdown ในเอกสาร Peer Review (`reviewer.md`) ให้ผมได้เป็นระเบียบ

**ข้อจำกัดที่พบ (Limitations & Challenges):**  
* **ความชัดเจนของ Prompt:** ในบางครั้ง AI ให้ผลลัพธ์เป็นข้อความยาว ซึ่งเกิดจาก Prompt ที่อธิบายผลลัพธ์ที่ต้องการยังไม่ชัดเจนมากพอ ซึ่งปรับได้โดยการใช้ Prompt ที่มีการระบุรูปแบบผลลัพธ์ เช่น เป็น Markdown Table เพื่อให้อ่านเข้าใจได้ง่ายขึ้น

> [!NOTE]
> **หมายเหตุการจัดทำเอกสาร:** เนื้อหาในส่วนของ Reflection มาจากความคิดเห็นของผมเองทั้งหมด โดยผมได้ใช้ **AI Agent ช่วยเรียบเรียงประโยคและจัดฟอร์แมต Markdown (Re-formatting & Polishing)** อีกครั้ง เพื่อให้เอกสารมีความสวยงาม อ่านง่าย และเป็นระเบียบเรียบร้อยยิ่งขึ้น

