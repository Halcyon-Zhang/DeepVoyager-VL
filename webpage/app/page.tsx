"use client";

import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import arxivLogo from "./images/logo/arxiv-mark.svg";
import githubLogo from "./images/logo/Octicons-mark-github.svg";
import huggingFaceLogo from "./images/logo/huggingface-mark.png";
import institute1Logo from "./images/logo/institute1.png";
import institute2Logo from "./images/logo/institute2.png";
import institute3Logo from "./images/logo/institute3-mark.png";
import institute4Logo from "./images/logo/institute4-mark.png";
import institute5Logo from "./images/logo/institute5-mark.png";
import institute6Logo from "./images/logo/institute6-flower.png";
import overviewFigure from "./images/paper/figure-overview.webp";
import paradigmsFigure from "./images/paper/figure-paradigms.webp";
import toolUsageFigure from "./images/paper/figure-tool-usage.webp";
import turnDistributionFigure from "./images/paper/figure-turn-distribution.webp";

const repository = "https://github.com/Halcyon-Zhang/DeepVoyager-VL";

const authors = [
  { name: "Huanyao Zhang", affiliation: "1", equal: true, leader: true },
  { name: "Jiepeng Zhou", affiliation: "2", equal: true },
  { name: "Runhao Zhao", affiliation: "3", equal: true },
  { name: "Yanzhe Shan", affiliation: "4" },
  { name: "Jiaoyang Chen", affiliation: "5" },
  { name: "Bowen Zhou", affiliation: "1" },
  { name: "Bo Li", affiliation: "1" },
  { name: "Fang Wang", affiliation: "1" },
  { name: "Jialong Wu", affiliation: "1" },
  { name: "Zhengwei Tao", affiliation: "1" },
  { name: "Lang Mei", affiliation: "6" },
  { name: "Xiaohan Yu", affiliation: "6" },
  { name: "Liyan Liu", affiliation: "6" },
  { name: "Chong Chen", affiliation: "6", corresponding: true },
  { name: "Wentao Zhang", affiliation: "1", corresponding: true },
];

const affiliations = [
  { id: "1", name: "Peking University", label: "Peking University", logo: institute1Logo },
  { id: "2", name: "HKUST (Guangzhou)", label: "HKUST (GZ)", logo: institute2Logo },
  { id: "3", name: "National University of Defense Technology", label: "NUDT", logo: institute3Logo },
  { id: "4", name: "Ocean University of China", label: "Ocean University", logo: institute4Logo },
  { id: "5", name: "Harbin Institute of Technology, Shenzhen", label: "HIT Shenzhen", logo: institute5Logo },
  { id: "6", name: "Huawei Cloud BU", label: "Huawei Cloud BU", logo: institute6Logo },
];

const sections = [
  { id: "overview", short: "Overview" },
  { id: "performance", short: "Performance" },
  { id: "ablation", short: "Ablation Study" },
  { id: "findings", short: "Findings" },
  { id: "bibtex", short: "BibTeX" },
];

type ResultRow = {
  name: string;
  values: string[];
  ours?: boolean;
};

const benchmarkColumns = [
  "MMSearch",
  "SimpleVQA",
  "LiveVQA",
  "FVQA",
  "BC-VL",
  "MM-BC",
  "MMSearch+",
  "VDR",
  "BC-V³",
  "VisBrowse",
  "Avg.",
];

const benchmarkGroups: { label: string; rows: ResultRow[] }[] = [
  {
    label: "Direct Answer",
    rows: [
      { name: "GPT-5.5", values: ["68.7", "67.0", "73.0", "66.7", "47.9", "17.5", "20.3", "18.6", "23.0", "36.1", "43.9"] },
      { name: "Gemini-3.1-Pro", values: ["64.2", "64.1", "65.0", "58.9", "41.4", "11.5", "26.4", "15.6", "19.3", "23.7", "39.0"] },
      { name: "Claude-Opus-4.6", values: ["59.8", "71.7", "53.1", "60.1", "43.5", "13.2", "13.2", "15.4", "15.0", "27.2", "37.2"] },
      { name: "Qwen3-VL-30B-A3B-Instruct", values: ["18.7", "53.2", "42.7", "34.7", "29.6", "4.0", "3.2", "3.8", "6.0", "11.2", "20.7"] },
      { name: "Qwen3-VL-8B-Instruct", values: ["15.2", "44.7", "41.0", "28.0", "25.1", "4.9", "3.2", "2.8", "1.0", "8.9", "17.5"] },
    ],
  },
  {
    label: "Agentic Workflow",
    rows: [
      { name: "GPT-5.5", values: ["82.7", "82.3", "90.3", "84.3", "68.2", "51.9", "48.6", "42.0", "55.0", "66.3", "67.2"] },
      { name: "Gemini-3.1-Pro", values: ["82.7", "81.0", "87.3", "81.3", "65.9", "44.4", "51.5", "40.8", "50.0", "62.1", "64.7"] },
      { name: "Claude-Opus-4.6", values: ["81.7", "81.7", "88.0", "79.3", "63.2", "49.4", "52.1", "36.6", "55.0", "62.7", "65.0"] },
      { name: "Qwen3-VL-30B-A3B-Instruct", values: ["64.7", "71.0", "73.3", "72.3", "41.6", "9.9", "17.7", "21.6", "11.3", "23.1", "40.7"] },
      { name: "Qwen3-VL-8B-Instruct", values: ["61.7", "60.0", "67.7", "69.7", "34.6", "5.8", "13.5", "16.8", "7.7", "15.4", "35.3"] },
    ],
  },
  {
    label: "Multimodal Deep Search Agents · 8B",
    rows: [
      { name: "MMSearch-R1-7B", values: ["53.8", "57.4", "48.4", "58.4", "—", "—", "—", "—", "4.0", "—", "—"] },
      { name: "WebWatcher-7B", values: ["49.1", "54.3", "51.2", "—", "21.2", "—", "—", "—", "4.7", "—", "—"] },
      { name: "DeepEyesV2-7B", values: ["63.7", "59.4", "—", "60.6", "—", "—", "—", "—", "—", "—", "—"] },
      { name: "SenseNova-MARS-8B", values: ["67.8", "70.2", "56.2", "67.1", "—", "—", "—", "—", "—", "—", "—"] },
      { name: "Vision-DeepResearch-8B", values: ["69.6", "—", "76.7", "64.7", "42.6", "—", "20.4", "29.2", "11.7", "—", "—"] },
      { name: "MM-DeepResearch-8B", values: ["67.8", "65.9", "65.0", "69.2", "37.9", "—", "—", "—", "—", "—", "—"] },
      { name: "POINTS-Seeker-8B", values: ["70.8", "68.8", "77.7", "71.2", "44.4", "—", "25.2", "—", "—", "—", "—"] },
      { name: "OpenSearch-VL-8B", values: ["64.5", "71.6", "59.6", "71.5", "37.6", "—", "—", "20.8", "—", "—", "—"] },
      { name: "SimpleSearch-VL-8B", values: ["77.1", "76.6", "75.2", "76.8", "52.1", "—", "32.5", "—", "—", "—", "—"] },
      { name: "Visual-Seeker-8B", values: ["72.2", "—", "—", "—", "47.6", "16.1", "27.3", "—", "—", "34.7", "—"] },
      { name: "DeepVoyager-VL-8B", values: ["72.7", "76.3", "82.7", "82.7", "58.4", "24.0", "37.1", "35.0", "32.3", "47.3", "54.8"], ours: true },
    ],
  },
  {
    label: "Multimodal Deep Search Agents · 30B",
    rows: [
      { name: "WebWatcher-32B", values: ["55.3", "59.0", "58.7", "—", "27.0", "—", "—", "—", "8.7", "—", "—"] },
      { name: "SenseNova-MARS-32B", values: ["74.3", "74.1", "60.8", "72.6", "—", "—", "—", "—", "—", "—", "—"] },
      { name: "Skywork-R1V4-30B-A3B", values: ["66.1", "—", "—", "67.2", "38.4", "—", "—", "—", "—", "—", "—"] },
      { name: "Vision-DeepResearch-30B-A3B", values: ["69.6", "—", "77.6", "74.2", "53.7", "—", "28.5", "37.8", "—", "—", "—"] },
      { name: "REDSearcher-MM-30B-A3B †", values: ["72.9", "—", "79.3", "—", "57.2", "23.5", "26.6", "—", "—", "—", "—"] },
      { name: "MM-DeepResearch-32B", values: ["69.0", "67.6", "68.0", "70.1", "43.0", "—", "—", "—", "—", "—", "—"] },
      { name: "LMM-Searcher-30B-A3B †‡", values: ["71.0 / 72.3", "—", "—", "—", "—", "22.3 / 30.1", "32.9 / 34.8", "—", "—", "42.0 / 48.3", "—"] },
      { name: "OpenSearch-VL-30B-A3B", values: ["68.7", "74.9", "67.4", "73.2", "41.1", "—", "—", "33.5", "—", "—", "—"] },
      { name: "SimpleSearch-VL-30B-A3B", values: ["83.6", "79.6", "81.1", "79.0", "55.9", "—", "34.4", "—", "—", "—", "—"] },
      { name: "DeepVoyager-VL-30B-A3B", values: ["74.0", "81.0", "82.7", "84.7", "64.2", "30.5", "40.6", "39.4", "35.0", "53.8", "58.6"], ours: true },
    ],
  },
];

const frameworkGroups = [
  {
    model: "GPT-5",
    rows: [
      { method: "Direct Answer", values: ["33.3", "10.3", "19.1", "26.0", "22.2"] },
      { method: "Vision-DeepResearch workflow", values: ["63.7", "—", "17.2", "—", "—"] },
      { method: "LMM-Searcher agentic search", values: ["72.2", "23.7", "34.8", "35.5", "41.6"] },
      { method: "DeepVoyager-VL (Ours)", values: ["79.7", "49.8", "50.8", "59.2", "59.8"], ours: true },
    ],
  },
  {
    model: "Gemini-2.5-Pro",
    rows: [
      { method: "Direct Answer", values: ["39.8", "10.3", "14.5", "27.2", "23.0"] },
      { method: "Vision-DeepResearch workflow", values: ["69.0", "—", "22.2", "—", "—"] },
      { method: "LMM-Searcher agentic search", values: ["66.3", "12.1", "28.1", "16.0", "30.6"] },
      { method: "DeepVoyager-VL (Ours)", values: ["72.0", "19.0", "33.4", "43.8", "42.1"], ours: true },
    ],
  },
  {
    model: "Qwen3-VL-30B-A3B-Thinking",
    rows: [
      { method: "Direct Answer", values: ["17.7", "7.1", "2.7", "13.0", "10.1"] },
      { method: "Vision-DeepResearch workflow", values: ["53.2", "—", "13.6", "—", "—"] },
      { method: "LMM-Searcher agentic search", values: ["62.0", "9.8", "14.4", "16.0", "25.6"] },
      { method: "DeepVoyager-VL (Ours)", values: ["70.0", "10.0", "20.9", "20.7", "30.4"], ours: true },
    ],
  },
];

const dataAblationRows: ResultRow[] = [
  { name: "Qwen3-VL-8B (Agentic)", values: ["34.6", "7.7", "15.4", "19.2"] },
  { name: "+ 20K multi-source trajectories", values: ["54.4", "26.7", "40.8", "40.6"] },
  { name: "+ 7K VIL trajectories", values: ["58.4", "32.3", "47.3", "46.0"], ours: true },
  { name: "Qwen3-VL-30B-A3B (Agentic)", values: ["41.6", "11.3", "23.1", "25.3"] },
  { name: "+ 20K multi-source trajectories", values: ["62.2", "28.7", "42.6", "44.5"] },
  { name: "+ 7K VIL trajectories", values: ["64.2", "35.0", "53.8", "51.0"], ours: true },
];

const frameworkAblationRows: ResultRow[] = [
  { name: "Full DeepVoyager-VL", values: ["78.0", "36.0", "39.3", "51.1"], ours: true },
  { name: "w/o Summary", values: ["74.0", "35.0", "32.3", "47.1"] },
  { name: "w/o Image Search", values: ["77.7", "35.4", "32.7", "48.6"] },
  { name: "w/o Fetch Image", values: ["76.3", "35.6", "33.3", "48.4"] },
  { name: "w/o Crop Image", values: ["75.7", "33.0", "36.3", "48.3"] },
];

const bibtex = `@misc{zhang2026deepvoyagervl,
  title        = {DeepVoyager-VL: Incentivizing Vision-in-the-Loop
                  Search for Long-Horizon Multimodal Agents},
  author       = {Zhang, Huanyao and Zhou, Jiepeng and Zhao, Runhao
                  and Shan, Yanzhe and Chen, Jiaoyang and Zhou, Bowen
                  and Li, Bo and Wang, Fang and Wu, Jialong and Tao, Zhengwei
                  and Mei, Lang and Yu, Xiaohan and Liu, Liyan
                  and Chen, Chong and Zhang, Wentao},
  year         = {2026},
  note         = {Preprint}
}`;

function SectionNavigation({ active, visible }: { active: string; visible: boolean }) {
  return (
    <aside
      className={`section-rail ${visible ? "is-visible" : ""} ${active === "bibtex" ? "on-dark" : ""}`}
      aria-label="Page sections"
    >
      <div className="rail-line" />
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={active === section.id ? "active" : ""}
          aria-current={active === section.id ? "location" : undefined}
        >
          <span className="rail-dot" />
          <small>{String(index + 1).padStart(2, "0")}</small>
          <b>{section.short}</b>
        </a>
      ))}
    </aside>
  );
}

function BenchmarkTable() {
  return (
    <figure className="data-card data-card-wide" data-reveal="scale">
      <div className="card-heading">
        <div>
          <h3>Performance across ten multimodal search benchmarks</h3>
        </div>
        <p>Accuracy or task-native score; higher is better.</p>
      </div>
      <div className="table-shell">
        <table className="paper-table benchmark-table">
          <thead>
            <tr>
              <th>Model</th>
              {benchmarkColumns.map((column) => <th key={column}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {benchmarkGroups.map((group) => (
              <Fragment key={group.label}>
                <tr className="table-group">
                  <th colSpan={benchmarkColumns.length + 1}>{group.label}</th>
                </tr>
                {group.rows.map((row) => (
                  <tr className={row.ours ? "ours-row" : ""} key={`${group.label}-${row.name}`}>
                    <th>{row.name}</th>
                    {row.values.map((value, index) => <td key={`${row.name}-${index}`}>{value}</td>)}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption>
        <span>Table 1.</span> Performance comparison across ten multimodal information-seeking benchmarks. Within each
        comparison group, the best and second-best results are bolded and underlined, respectively.
        † denotes initialization from a Thinking checkpoint; ‡ denotes LMM-Searcher&apos;s
        30-turn / 100-turn settings (x / y).
      </figcaption>
    </figure>
  );
}

function FrameworkTable() {
  const columns = ["MMSearch", "MM-BC", "MMSearch+", "VisBrowse", "Avg."];
  return (
    <figure className="data-card data-card-wide" data-reveal="scale">
      <div className="card-heading">
        <div>
          <h3>Framework comparison across base models</h3>
        </div>
        <p>All framework evaluations use up to 50 interaction turns.</p>
      </div>
      <div className="table-shell">
        <table className="paper-table framework-table">
          <thead>
            <tr>
              <th>Base model</th>
              <th>Evaluation method</th>
              {columns.map((column) => <th key={column}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {frameworkGroups.map((group) => (
              <Fragment key={group.model}>
                {group.rows.map((row, index) => (
                  <tr className={row.ours ? "ours-row" : ""} key={`${group.model}-${row.method}`}>
                    {index === 0 && <th rowSpan={group.rows.length}>{group.model}</th>}
                    <th>{row.method}</th>
                    {row.values.map((value, valueIndex) => (
                      <td key={`${group.model}-${row.method}-${valueIndex}`}>{value}</td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption>
        <span>Table 2.</span> Performance comparison of different multimodal search frameworks across three base models.
        The average is computed over four benchmarks; “—” denotes unreported results.
      </figcaption>
    </figure>
  );
}

function CompactTable({
  number,
  title,
  columns,
  rows,
  caption,
}: {
  number: string;
  title: string;
  columns: string[];
  rows: ResultRow[];
  caption: string;
}) {
  return (
    <figure className="data-card compact-data-card" data-reveal="scale">
      <div className="card-heading">
        <div>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="table-shell">
        <table className="paper-table compact-table">
          <thead>
            <tr>
              <th>Setting</th>
              {columns.map((column) => <th key={column}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr className={row.ours ? "ours-row" : ""} key={`${row.name}-${rowIndex}`}>
                <th>{row.name}</th>
                {row.values.map((value, index) => <td key={`${row.name}-${index}`}>{value}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption><span>{number}.</span> {caption}</figcaption>
    </figure>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("overview");
  const [showSectionNavigation, setShowSectionNavigation] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const elements = sections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const overview = elements[0];
    let animationFrame = 0;

    const updateNavigation = () => {
      animationFrame = 0;
      const readingLine = window.innerHeight * 0.38;
      let currentSection = elements[0]?.id ?? "overview";

      elements.forEach((element) => {
        if (element.getBoundingClientRect().top <= readingLine) currentSection = element.id;
      });
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 24) {
        currentSection = elements.at(-1)?.id ?? currentSection;
      }

      setActiveSection(currentSection);
      setShowSectionNavigation(
        Boolean(overview && overview.getBoundingClientRect().top <= window.innerHeight * 0.7),
      );
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateNavigation);
    };

    updateNavigation();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-revealed", entry.isIntersecting);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -9% 0px" },
    );

    elements.forEach((element) => element.classList.add("reveal-ready"));
    const animationFrame = window.requestAnimationFrame(() => {
      elements.forEach((element) => observer.observe(element));
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, []);

  const copyBibtex = async () => {
    await navigator.clipboard.writeText(bibtex);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main id="top">
      <nav className="site-nav">
        <div className="wide-container nav-inner">
          <a className="brand" href="#top">DeepVoyager-VL</a>
          <a className="github-link" href={repository} target="_blank" rel="noreferrer">
            <Image className="github-icon" src={githubLogo} alt="" aria-hidden="true" />
            GitHub Repo <span aria-hidden="true">↗</span>
          </a>
        </div>
      </nav>

      <SectionNavigation active={activeSection} visible={showSectionNavigation} />

      <header className="paper-hero container">
        <div className="venue-label" data-reveal="up"> Multimodal Deep Search · 2026</div>
        <h1 data-reveal="up" data-reveal-delay="1">DeepVoyager-VL</h1>
        <p className="paper-title" data-reveal="up" data-reveal-delay="2">
          Incentivizing Vision-in-the-Loop Search for Long-Horizon Multimodal Agents
        </p>
        <div className="author-list" aria-label="Paper authors" data-reveal="up" data-reveal-delay="3">
          {authors.map((author) => (
            <span key={author.name}>
              {author.name}
              <sup>
                {author.affiliation}
                {author.equal && "◇"}
                {author.leader && <i className="leader-mark" role="img" aria-label="Project leader" />}
                {author.corresponding && "†"}
              </sup>
            </span>
          ))}
        </div>
        <p className="author-note" data-reveal="up" data-reveal-delay="3">
          <span>◇ Equal contribution</span>
          <span><i className="leader-mark" aria-hidden="true" /> Project leader</span>
          <span>† Corresponding authors</span>
        </p>
        <div className="affiliation-logos" aria-label="Author affiliations" data-reveal="scale">
          {affiliations.map((affiliation) => (
            <div className={`affiliation-logo affiliation-logo-${affiliation.id}`} key={affiliation.id} title={affiliation.name}>
              <span className="affiliation-image">
                <Image src={affiliation.logo} alt={`${affiliation.name} logo`} />
              </span>
              <span className="affiliation-caption"><sup>{affiliation.id}</sup>{affiliation.label}</span>
            </div>
          ))}
        </div>
        <div className="paper-tags" data-reveal="up" data-reveal-delay="1">
          <span>Vision in the Loop</span>
          <span>Long-Horizon Search</span>
          <span>Supervised Fine-Tuning</span>
          <span>Multimodal Event Graph</span>
        </div>
        <div className="resource-links" data-reveal="up" data-reveal-delay="2">
          <div className="resource-row">
            <span className="resource primary resource-pending" title="Paper release coming soon">
              <Image className="resource-logo arxiv-logo" src={arxivLogo} alt="" />
              <span><b>Paper</b></span>
            </span>
            <a className="resource" href={repository} target="_blank" rel="noreferrer">
              <Image className="resource-logo github-resource-logo" src={githubLogo} alt="" />
              <span><b>Code</b></span>
            </a>
            <span className="resource resource-pending" title="Dataset release coming soon">
              <Image className="resource-logo huggingface-logo" src={huggingFaceLogo} alt="" />
              <span><b>Dataset</b></span>
            </span>
          </div>
          <div className="resource-row">
            <span className="resource resource-pending" title="Model release coming soon">
              <Image className="resource-logo huggingface-logo" src={huggingFaceLogo} alt="" />
              <span><b>DeepVoyager-VL-8B</b></span>
            </span>
            <span className="resource resource-pending" title="Model release coming soon">
              <Image className="resource-logo huggingface-logo" src={huggingFaceLogo} alt="" />
              <span><b>DeepVoyager-VL-30B</b></span>
            </span>
          </div>
        </div>
      </header>

      <section className="paper-section container" id="overview">
        <div className="section-number" data-reveal="up">01 / Overview</div>
        <div className="section-intro" data-reveal="up" data-reveal-delay="1">
          <h2>Vision in the loop, not only at the input.</h2>
          <div>
            <p>
              <b>The supervision gap.</b> As Figure 1(a)–(c) shows, existing methods build the
              reasoning chain in text first and place vision at the input or near the answer, so
              acquired images rarely drive later retrieval.
            </p>
            <p>
              <b>EventVoyage-VL</b> is our structure-before-language synthesis pipeline and resulting
              vision-in-the-loop data source. As Figure 1(d)–(e) shows, it creates long-horizon
              questions with intermediate visual dependencies; the curated trajectories are then
              distilled into <b>DeepVoyager-VL</b>.
            </p>
          </div>
        </div>

        <div className="figure-stack">
          <figure className="figure-card" data-reveal="scale">
            <div className="figure-heading">
              <h3>Comparison of multimodal search data synthesis paradigms</h3>
            </div>
            <div className="figure-frame">
              <Image
                src={paradigmsFigure}
                alt="Comparison of four multimodal search data synthesis paradigms and a long-horizon vision-in-the-loop example"
                sizes="(max-width: 900px) 94vw, 1080px"
              />
            </div>
            <figcaption>
              <p>
                <span>Figure 1.</span> Comparison of multimodal search data synthesis paradigms.
                Prior methods place vision at the input through entity substitution (a),
                concentrate visual reasoning before text-based search (b), or graft visual evidence
                near the answer (c). We instead synthesize vision-in-the-loop questions from a
                visually enriched multimodal event graph (d), as illustrated by a representative
                long-horizon example (e).
              </p>
            </figcaption>
          </figure>

          <figure className="figure-card" data-reveal="scale">
            <div className="figure-heading">
              <h3>Overview of DeepVoyager-VL</h3>
            </div>
            <div className="figure-frame">
              <Image
                src={overviewFigure}
                alt="Five-stage overview of DeepVoyager-VL from multimodal event graph construction through supervised fine-tuning"
                sizes="(max-width: 900px) 94vw, 1080px"
              />
            </div>
            <figcaption>
              <p>
                <span>Figure 2.</span> Overview of DeepVoyager-VL, encompassing vision-in-the-loop
                data synthesis, difficulty-aware trajectory curation, and supervised agent training.
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="paper-section section-band" id="performance">
        <div className="container section-inner">
          <div className="section-number" data-reveal="up">02 / Performance</div>
          <div className="section-intro compact-intro" data-reveal="up" data-reveal-delay="1">
            <h2>Leading multimodal search performance at both scales.</h2>
            <p>
              Across ten multimodal search benchmarks, <b>DeepVoyager-VL-8B</b> and
              <b> DeepVoyager-VL-30B-A3B</b> outperform scale-matched multimodal search agents on
              <b> eight</b> and <b>nine</b> benchmarks, respectively, while the same framework also
              transfers consistently across <b>three different base models</b>.
            </p>
          </div>
          <div className="result-highlights">
            <article data-reveal="up">
              <span className="result-model">DeepVoyager-VL-8B</span>
              <strong>54.8</strong>
              <span className="result-detail">Average score · best on 8 of 10 benchmarks</span>
            </article>
            <article data-reveal="up" data-reveal-delay="1">
              <span className="result-model">DeepVoyager-VL-30B-A3B</span>
              <strong>58.6</strong>
              <span className="result-detail">Average score · best on 9 of 10 benchmarks</span>
            </article>
          </div>
          <div className="data-stack">
            <BenchmarkTable />
            <FrameworkTable />
          </div>
        </div>
      </section>

      <section className="paper-section container" id="ablation">
        <div className="section-number" data-reveal="up">03 / Ablation study</div>
        <div className="section-intro compact-intro" data-reveal="up" data-reveal-delay="1">
          <h2>Both the data and the agent design matter.</h2>
          <p>
            Adding <b>7K vision-in-the-loop trajectories</b> yields further average gains of
            <b> +5.4</b> for 8B and <b>+6.5</b> for 30B, while removing any core agent component
            lowers average performance by <b>2.5–4.0 points</b>.
          </p>
        </div>
        <div className="ablation-grid">
          <CompactTable
            number="Table 3"
            title="Training-data ablation"
            columns={["BC-VL", "BC-V³", "VisBrowse", "Avg."]}
            rows={dataAblationRows}
            caption="Cumulative training-data ablation: 20K multi-source trajectories followed by 7K VIL trajectories."
          />
          <CompactTable
            number="Table 4"
            title="Framework component ablation"
            columns={["FVQA", "VDR", "BC-V³", "Avg."]}
            rows={frameworkAblationRows}
            caption="DeepVoyager-VL component ablation with Qwen3.6-35B-A3B; each setting removes one component."
          />
        </div>
      </section>

      <section className="paper-section section-band findings-section" id="findings">
        <div className="container section-inner">
          <div className="section-number" data-reveal="up">04 / Findings</div>
          <div className="section-intro compact-intro" data-reveal="up" data-reveal-delay="1">
            <h2>The learned behavior is longer and more visual.</h2>
            <p>
              Under unified rollouts, <b>EventVoyage-VL</b> yields <b>64.3% visual-tool calls</b> and
              peaks at <b>16–20 turns</b>, compared with at most 40.6% visual-tool use and
              1–10-turn peaks in prior datasets.
            </p>
          </div>

          <div className="insight-grid">
            <article data-reveal="up">
              <span>Visual tool engagement</span>
              <strong>64.3%</strong>
              <p>of tool calls are visual, versus 40.6%, 30.3%, and 10.1% in three public datasets.</p>
            </article>
            <article data-reveal="up" data-reveal-delay="1">
              <span>Interaction horizon</span>
              <strong>16–20</strong>
              <p>turns is the peak interval for our trajectories; existing datasets peak within 1–10 turns.</p>
            </article>
            <article data-reveal="up" data-reveal-delay="2">
              <span>VIL trajectory gain</span>
              <strong>+6.5</strong>
              <p>average points from 7K VIL trajectories on the 30B model, beyond a strong 20K mixture.</p>
            </article>
            <article data-reveal="up" data-reveal-delay="3">
              <span>Training recipe</span>
              <strong>SFT only</strong>
              <p>achieves 54.8 and 58.6 average scores without an additional reinforcement-learning stage.</p>
            </article>
          </div>

          <figure className="figure-card analysis-figure" data-reveal="scale">
            <div className="figure-heading">
              <h3>Trajectory analysis</h3>
            </div>
            <div className="analysis-grid">
              <div>
                <Image
                  src={toolUsageFigure}
                  alt="Tool-call proportions showing greater visual tool use in EventVoyage-VL"
                  sizes="(max-width: 900px) 90vw, 520px"
                />
                <b>(a) Visual tool engagement</b>
              </div>
              <div>
                <Image
                  src={turnDistributionFigure}
                  alt="Trajectory turn distribution showing a longer interaction horizon for EventVoyage-VL"
                  sizes="(max-width: 900px) 90vw, 520px"
                />
                <b>(b) Interaction horizon</b>
              </div>
            </div>
            <figcaption>
              <p>
                <span>Figure 3.</span> Trajectory statistics from unified Doubao-2.0-Pro rollouts on
                1,000 examples per dataset. <b>(a)</b> Tool-call proportions by functional category.
                <b> (b)</b> Trajectory counts in five-turn intervals. OSVL, VDR, and RED-MM denote
                OpenSearch-VL, Vision-DeepResearch, and REDSearcher-MM, respectively.
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bibtex-section" id="bibtex">
        <div className="container bibtex-layout">
          <div data-reveal="up">
            <div className="section-number">05 / BibTeX</div>
            <h2>Cite <span className="bibtex-name">DeepVoyager-VL.</span></h2>
          </div>
          <div className="bibtex-card" data-reveal="scale" data-reveal-delay="1">
            <button type="button" onClick={copyBibtex} aria-live="polite">
              {copied ? "Copied" : "Copy BibTeX"}
            </button>
            <pre><code>{bibtex}</code></pre>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer-inner">
          <a className="brand" href="#top">DeepVoyager-VL</a>
          <p className="footer-tagline">Vision-in-the-loop · Long-horizon multimodal search</p>
          <p className="footer-copyright">DeepVoyager-VL © 2026</p>
        </div>
      </footer>
    </main>
  );
}
