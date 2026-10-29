"use client";
import { useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import type { SiteDocument, SectionCopy, Project } from "@/lib/cms/schema";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  AutoMockup,
  PropertyMockup,
  RetailMockup,
} from "@/components/ui/mockups";
import { Reveal } from "@/components/animations/reveal";
import Image from "next/image";
import Link from "next/link";
import { pageHref } from "@/lib/site-pages";
import {
  getBundledProjectImage,
  isBundledProjectImage,
} from "@/lib/cms/project-media";
export function Work({
  projects,
  copy,
  websiteService,
  preview: draftPreview = false,
  headingAs = "h2",
}: {
  projects: SiteDocument["projects"];
  copy: SectionCopy;
  websiteService: string;
  preview?: boolean;
  headingAs?: "h1" | "h2";
}) {
  const CardHeading = headingAs === "h1" ? "h2" : "h3";
  const [selected, setSelected] = useState<Project>(projects[0]);
  const dialog = useRef<HTMLDialogElement>(null);
  function preview(project: Project) {
    setSelected(project);
    dialog.current?.showModal();
  }
  const mockup = (theme: string) =>
    theme === "auto" ? (
      <AutoMockup />
    ) : theme === "property" ? (
      <PropertyMockup />
    ) : (
      <RetailMockup />
    );
  return (
    <section id="work" className="section work-section">
      <div className="container">
        <SectionHeading
          copy={copy}
          headingAs={headingAs}
          disclaimer={
            projects.every((p) => p.isConcept)
              ? "CONCEPT WORK — A GLIMPSE OF WHAT’S POSSIBLE"
              : "SELECTED PROJECTS / DESIGNED WITH INTENTION"
          }
        />
        <div className="work-grid">
          {projects.map((project, i) => (
            <Reveal
              key={project.id}
              className={`work-card work-${project.theme}`}
              delay={i * 0.06}
            >
              <button
                className={`work-preview ${project.imageUrl ? "has-project-image" : ""}`}
                aria-label={`Preview ${project.name}`}
                onClick={() => preview(project)}
              >
                <div className="project-preview-top">
                  <span>
                    0{i + 1} /{" "}
                    {project.isConcept ? "CONCEPT PROJECT" : "PROJECT"}
                  </span>
                  <span>
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <div
                  className="project-mockup"
                  aria-hidden={!project.imageUrl || undefined}
                >
                  {project.imageUrl ? (
                    <Image
                      className="project-cover"
                      src={project.imageUrl}
                      alt={`${project.name} — ${project.isConcept ? "concept design" : "project"}: ${project.title}`}
                      width={1200}
                      height={
                        getBundledProjectImage(project.imageUrl)?.height ?? 800
                      }
                      sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      unoptimized={!isBundledProjectImage(project.imageUrl)}
                    />
                  ) : (
                    mockup(project.theme)
                  )}
                </div>
                <span className="preview-label">
                  {project.isConcept ? "EXPLORE CONCEPT" : "EXPLORE PROJECT"}{" "}
                  <ArrowUpRight size={12} />
                </span>
              </button>
              <div className="project-info">
                <span className="eyebrow">{project.category}</span>
                <CardHeading>{project.title}</CardHeading>
                <p>{project.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="work-bottom">
          <p>Your business could be our next great project.</p>
          <Link
            href={pageHref("contact", draftPreview)}
            className="text-button"
          >
            Let&apos;s make it happen <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
      <dialog
        ref={dialog}
        className="project-dialog"
        aria-labelledby="project-dialog-title"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="dialog-body">
          <button
            className="dialog-close"
            aria-label="Close project preview"
            onClick={() => dialog.current?.close()}
          >
            <X size={22} />
          </button>
          <span className="eyebrow">
            {selected.isConcept ? "CONCEPT PROJECT" : "PROJECT"} /{" "}
            {selected.category}
          </span>
          <h2 id="project-dialog-title">{selected.title}</h2>
          <div
            className="dialog-mockup"
            aria-hidden={!selected.imageUrl || undefined}
          >
            {selected.imageUrl ? (
              <Image
                className="project-cover"
                src={selected.imageUrl}
                alt={`${selected.name} — ${selected.isConcept ? "concept design" : "project"}: ${selected.title}`}
                width={1200}
                height={
                  getBundledProjectImage(selected.imageUrl)?.height ?? 800
                }
                sizes="(max-width: 800px) 100vw, 900px"
                unoptimized={!isBundledProjectImage(selected.imageUrl)}
              />
            ) : (
              mockup(selected.theme)
            )}
          </div>
          <p>
            {selected.description}{" "}
            {selected.isConcept
              ? "This is an illustrative design concept, not a completed client project."
              : ""}
          </p>
          {selected.websiteUrl ? (
            <a
              href={selected.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-button project-website"
            >
              Visit project website <ArrowUpRight size={16} />
            </a>
          ) : null}
          <Link
            href={pageHref("contact", draftPreview, {
              service: websiteService,
            })}
            className="button"
            onClick={() => dialog.current?.close()}
          >
            Build something for my business <ArrowUpRight size={17} />
          </Link>
        </div>
      </dialog>
    </section>
  );
}
