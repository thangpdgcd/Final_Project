import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  HeadingLevel,
} from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rows = [
  {
    id: "1",
    url: "/api/login",
    method: "POST",
    description: "Log in with username and password",
    params: "Email, password",
    returns: "Username, token, status, message, role, username",
  },
  {
    id: "2",
    url: "/api/registerNewUser",
    method: "POST",
    description: "Register a new user",
    params:
      "Email, password, firstName, lastName, address, phonenumber, gender, roleId, positionId, image",
    returns: "status, message, token",
  },
  {
    id: "3",
    url: "/api/users",
    method: "POST",
    description: "Log in with Google email",
    params: "User-Google",
    returns: "status, message, token, role, username",
  },
  {
    id: "4",
    url: "/api/get-all-users",
    method: "GET",
    description: "Get all list users",
    params: "NONE",
    returns: "status, message, users data",
  },
  {
    id: "5",
    url: "/api/create-new-user",
    method: "POST",
    description: "Create a new user",
    params:
      "Email, password, firstName, lastName, address, phonenumber, gender, roleId, positionId, image",
    returns: "status, message",
  },
  {
    id: "6",
    url: "/api/change-password",
    method: "POST",
    description: "Change user password",
    params: "Username and password",
    returns: "status, message",
  },
  {
    id: "7",
    url: "/api/edit-user",
    method: "PUT",
    description: "Edit user details",
    params: "UserId",
    returns: "status, message",
  },
  {
    id: "8",
    url: "/api/delete-user",
    method: "DELETE",
    description: "Delete user",
    params: "UserId",
    returns: "status, message",
  },
];

const header = ["Id", "URL", "Method", "Description", "Params", "Returns"];

const cell = (text, { bold = false, code = false } = {}) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: String(text ?? ""),
            bold,
            font: code ? "Consolas" : "Calibri",
          }),
        ],
      }),
    ],
  });

const table = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: header.map((h) => cell(h, { bold: true })),
    }),
    ...rows.map(
      (r) =>
        new TableRow({
          children: [
            cell(r.id),
            cell(r.url, { code: true }),
            cell(r.method),
            cell(r.description),
            cell(r.params),
            cell(r.returns),
          ],
        }),
    ),
  ],
});

const doc = new Document({
  sections: [
    {
      children: [
        new Paragraph({
          text: "Danh sách API Routes (theo bảng yêu cầu)",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: "" }),
        table,
      ],
    },
  ],
});

const outPath = path.resolve(__dirname, "..", "docs", "api-routes.docx");
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buf);
console.log(`Wrote ${outPath}`);

