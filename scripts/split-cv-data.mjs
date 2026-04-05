import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const old = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/cv_old.json"), "utf8"),
);
const outDir = path.join(root, "src/data/cv");
fs.mkdirSync(outDir, { recursive: true });

function tuplesToItems(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((row) => {
    const [title, subtitle, date] = row;
    return { title, subtitle: subtitle ?? "", date: date ?? "" };
  });
}

function menteesToItems(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(([program, name, year]) => ({
    title: program,
    subtitle: name,
    date: year ?? "",
  }));
}

const experienceOrder = [
  "startup",
  "quantinuum",
  "ml",
  "quera",
  "uav",
  "arm",
];
const experience = experienceOrder
  .filter((k) => old.experience?.[k])
  .map((id) => ({
    id,
    head: old.experience[id].head,
    bullets: (old.experience[id].content || []).map((c) => ({
      text: c.text,
      links: c.links,
    })),
  }));

const profile = {
  urls: old.urls,
  interests: old.interests ?? [],
  skillList: old.skillList ?? [],
  summaries: {
    ceo: old.summary_ceo,
    RS: old.summary_RS,
    RS_cas: old.summary_RS_cas,
    op: old.summary_op,
    web: old.summary_web,
    qml: old.summary_qml,
  },
  statementsNote:
    "Long-form statements live in src/content/cv/research-statement.mdx and teaching-statement.mdx",
  contactBanner: old.banner ?? [],
};

const education = [
  {
    title: "Ph.D. in Electrical and Computer Engineering",
    subtitle: "Purdue University",
    date: "2019–2024",
    detail:
      "Dissertation and research: machine learning for nanophotonics, quantum sampling, and optimization (NanoML / QSC). (Edit src/data/cv/education.json to match your record.)",
  },
  {
    title: "B.S. in Electrical and Computer Engineering (or related)",
    subtitle: "Purdue University",
    date: "2013–2017",
    detail: "Update degrees in education.json as needed.",
  },
];

const service = {
  leadership: tuplesToItems(old.leadership),
  speaking: tuplesToItems(old.speaking),
  refereeRoles: tuplesToItems(old.refereeRoles),
  teachingRoles: tuplesToItems(old.teachingRoles),
  competitions: tuplesToItems(old.competitions),
  extWork: tuplesToItems(old.extWork),
};

const funding = {
  grants: tuplesToItems(old.grants),
  fellowships: tuplesToItems(old.fellowships),
  funding: tuplesToItems(old.funding),
};

/** Name + email only (omit phone column from source). */
const referencesPublic = (old.refsnophone || []).map(([name, email]) => ({
  title: name,
  subtitle: email ?? "",
}));

const write = (name, data) => {
  fs.writeFileSync(
    path.join(outDir, name),
    JSON.stringify(data, null, 2) + "\n",
    "utf8",
  );
};

write("profile.json", profile);
write("education.json", education);
write("experience.json", { roles: experience });
write("service.json", service);
write("funding.json", funding);
write("papers.json", old.pubs ?? []);
write("conferences.json", old.confs ?? []);
write("news.json", old.news ?? []);
write("affiliations.json", tuplesToItems(old.affiliations));
write("mentorship.json", {
  highlights: menteesToItems(old.mentees),
  mentees: [],
});
write("software.json", tuplesToItems(old.extSWE));
write("references.json", referencesPublic);

console.log("Wrote", outDir);
