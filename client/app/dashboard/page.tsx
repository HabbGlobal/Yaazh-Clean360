"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import yaazhLogo from "@/assets/logo yaazh.png";
import ResidentNav from "@/components/common/ResidentNav";
import { api } from "@/lib/api";
import type { Complaint, ComplaintType, FeedbackSummary, ReadinessResponse, ReadinessSummary, Schedule, User, Zone } from "@/types";

const complaintLabels: Record<ComplaintType, string> = {
  "lorry-did-not-come": "Lorry did not come",
  "skipped-my-street": "Skipped my street",
  "irregular-collection": "Irregular collection",
  other: "Other collection issue"
};

const voteStatusLabels: Record<ReadinessResponse, string> = {
  ready: "Given",
  "not-ready": "Not given"
};

function formatShortDate(value: string) {
  return value.slice(5);
}

function complaintReplyMessage(complaint: Complaint) {
  if (complaint.resolutionNote?.trim()) return complaint.resolutionNote;
  if (complaint.status === "in-review") return "Your complaint is being reviewed. We will reply soon.";
  if (complaint.status === "resolved") return "This complaint is marked resolved. No written reply was added yet.";
  return "We are waiting for an admin reply. We will reply soon.";
}

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read photo evidence"));
    reader.readAsDataURL(file);
  });
}

export default function Dashboard() {
  const [user, setUser] = useState<User>();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [readiness, setReadiness] = useState<ReadinessSummary>();
  const [readinessHistory, setReadinessHistory] = useState<ReadinessSummary[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [feedback, setFeedback] = useState<FeedbackSummary>({ items: [], averageRating: 0, total: 0 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const zone = typeof user?.zoneId === "string" ? undefined : user?.zoneId as Zone | undefined;

  async function loadDashboard() {
    const current = await api.me();
    setUser(current);
    const zoneId = typeof current.zoneId === "string" ? current.zoneId : current.zoneId?._id;
    if (!zoneId) return;
    const [scheduleData, readinessData, historyData, complaintData, feedbackData] = await Promise.all([
      api.schedules(zoneId),
      api.readiness(),
      api.readinessHistory(),
      api.complaints(),
      api.feedback()
    ]);
    setSchedules(scheduleData);
    setReadiness(readinessData);
    setReadinessHistory(historyData);
    setComplaints(complaintData);
    setFeedback(feedbackData);
  }

  useEffect(() => {
    loadDashboard().catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard"));
  }, []);

  const nextCollection = useMemo(() => schedules[0], [schedules]);

  async function vote(response: ReadinessResponse) {
    setError("");
    try {
      await api.voteReadiness(response);
      const [readinessData, historyData] = await Promise.all([api.readiness(), api.readinessHistory()]);
      setReadiness(readinessData);
      setReadinessHistory(historyData);
      setMessage("Readiness vote saved");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save vote");
    }
  }

  async function deleteComplaint(id: string) {
    setError("");
    try {
      await api.deleteComplaint(id);
      setComplaints(await api.complaints());
      setMessage("Complaint deleted");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete complaint");
    }
  }

  async function submitComplaint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const file = form.get("photoEvidence") as File;
    try {
      let photoEvidence: string | undefined;
      if (file?.size) {
        if (file.size > 2_000_000) throw new Error("Choose a photo smaller than 2 MB");
        photoEvidence = await fileToBase64(file);
      }
      await api.createComplaint({ complaintType: String(form.get("complaintType")) as ComplaintType, description: String(form.get("description")), photoEvidence });
      setComplaints(await api.complaints());
      setMessage("Complaint submitted");
      event.currentTarget.reset();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to submit complaint");
    }
  }

  async function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api.createFeedback({ rating: Number(form.get("rating")), comment: String(form.get("comment") || "") });
      setFeedback(await api.feedback());
      setMessage("Feedback submitted");
      event.currentTarget.reset();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to submit feedback");
    }
  }

  if (error && !user) return <p className="error">{error}. <Link href="/login">Sign in</Link></p>;
  if (!user) return <section className="resident-dashboard resident-dashboard--loading"><p>Loading your dashboard...</p></section>;
  if (!user.zoneId) return <section className="resident-dashboard resident-dashboard--loading"><div className="resident-card"><h1>Select your zone first</h1><Link className="resident-button" href="/select-zone">Select zone</Link></div></section>;

  return (
    <section className="resident-dashboard">
      <ResidentNav user={user} />

      <div className="resident-container">
        <header className="resident-hero">
          <Image className="resident-hero-watermark" src={yaazhLogo} alt="" aria-hidden="true" priority />
          <div>
            <p className="np-sticker np-sticker--yellow">Resident control room</p>
            <h1 className="resident-welcome-title" aria-label={`Welcome, ${user.name}. ${zone?.name || "Your zone"} collection dashboard`}>
              <span className="resident-welcome-kicker">Welcome,</span>
              <span className="resident-welcome-name">{user.name}</span>
              <span className="resident-welcome-zone">{zone?.name || "Your zone"} collection dashboard</span>
            </h1>
            <p>Track your lorry, schedule, readiness voting, complaint status, and service rating from one mobile-friendly workspace.</p>
          </div>
          <aside className="resident-lorry-card">
            {zone?.imageBase64 && <img className="resident-zone-image" src={zone.imageBase64} alt={`${zone.name} map`} />}
            <span>Assigned lorry</span>
            <strong>{zone?.assignedLorry || "Loading"}</strong>
            <small>Pradesa Sabha help is available from the glowing call popup.</small>
          </aside>
        </header>

        {message && <p className="resident-message">{message}</p>}
        {error && <p className="error resident-error">{error}</p>}

        <div className="resident-grid">
          <article className="resident-card resident-card--wide" id="schedule">
            <div className="resident-card-head"><span>Collection Schedule</span><strong>{nextCollection ? `${nextCollection.weekday} ${nextCollection.collectionTime}` : "No schedule yet"}</strong></div>
            <div className="resident-schedule-list">
              {schedules.map((schedule) => <div key={schedule._id}><b>{schedule.weekday}</b><span>{schedule.wasteType}</span><small>{schedule.collectionTime} {schedule.notes}</small></div>)}
              {!schedules.length && <p className="muted">Your zone schedule will appear after an administrator publishes it.</p>}
            </div>
          </article>

          <article className="resident-card" id="voting">
            <div className="resident-card-head"><span>Daily Readiness Voting</span><strong>{readiness?.voteDate || new Date().toISOString().slice(0, 10)}</strong></div>
            <h3 className="resident-card-title">{readiness?.myResponse ? `Today you marked: ${voteStatusLabels[readiness.myResponse]}` : "Vote once today, edit anytime before the day ends"}</h3>
            <p className="resident-vote-note">{readiness?.isCollectionDay === false ? "Today is not a waste collection day. Voting opens again on the next Monday-Saturday collection day." : "One vote is saved per resident per collection day. Clicking again updates today's choice."}</p>
            <div className="resident-stacked-progress" aria-label="Today's zone voting progress">
              <i className="resident-stacked-progress__given" style={{ width: `${readiness?.readyPercentage || 0}%` }} />
              <i className="resident-stacked-progress__not-given" style={{ width: `${readiness?.notReadyPercentage || 0}%` }} />
              <i className="resident-stacked-progress__not-voted" style={{ width: `${Math.max(0, 100 - (readiness?.votedPercentage || 0))}%` }} />
            </div>
            <div className="resident-vote-stats">
              <span><b>{readiness?.ready || 0}</b>Given</span>
              <span><b>{readiness?.notReady || 0}</b>Not given</span>
              <span><b>{readiness?.total || 0}</b>Voted</span>
              <span><b>{readiness?.notVoted || 0}</b>Not voted</span>
            </div>
            <div className="resident-actions">
              <button disabled={readiness?.isCollectionDay === false} className={readiness?.myResponse === "ready" ? "active" : ""} onClick={() => vote("ready")}>{readiness?.myResponse === "ready" ? "Given selected" : "Given"}</button>
              <button disabled={readiness?.isCollectionDay === false} className={readiness?.myResponse === "not-ready" ? "active" : ""} onClick={() => vote("not-ready")}>{readiness?.myResponse === "not-ready" ? "Not given selected" : "Not given"}</button>
            </div>
            <section className="resident-history-panel" aria-label="Past seven days voting">
              <div className="resident-history-head">
                <span>Past voting</span>
                <strong>Last 7 days</strong>
              </div>
              <div className="resident-history">
                {readinessHistory.map((day) => {
                  const status = day.myResponse ? voteStatusLabels[day.myResponse] : "Not voted";
                  return (
                    <div className={`resident-history-day ${day.myResponse ? `resident-history-day--${day.myResponse}` : "resident-history-day--empty"}`} key={day.voteDate}>
                      <span>{formatShortDate(day.voteDate)}</span>
                      <b>{status}</b>
                    </div>
                  );
                })}
              </div>
            </section>
          </article>

          <article className="resident-card resident-card--complaint" id="complaints">
            <div className="resident-card-head"><span>Complaints</span><strong>{complaints.length} reports</strong></div>
            <form onSubmit={submitComplaint}>
              <select name="complaintType" required>{Object.entries(complaintLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
              <textarea name="description" placeholder="Describe timing, landmark, or impact" minLength={10} required />
              <input name="photoEvidence" type="file" accept="image/png,image/jpeg,image/webp" />
              <button>Submit complaint</button>
            </form>
          </article>

          <article className="resident-card" id="feedback">
            <div className="resident-card-head"><span>Feedback</span><strong>{feedback.total} entries</strong></div>
            <form onSubmit={submitFeedback}>
              <select name="rating" required>
                {[5, 4, 3, 2, 1].map((rating) => <option value={rating} key={rating}>{rating} star{rating > 1 ? "s" : ""}</option>)}
              </select>
              <textarea name="comment" placeholder="Optional service comment" />
              <button>Submit feedback</button>
            </form>
          </article>

          <article className="resident-card" id="rating">
            <div className="resident-card-head"><span>Service Rating</span><strong>{feedback.averageRating || "0.0"}/5</strong></div>
            <div className="resident-stars" aria-label={`Average rating ${feedback.averageRating} out of 5`}>
              {[1, 2, 3, 4, 5].map((star) => <span className={star <= Math.round(feedback.averageRating) ? "filled" : ""} key={star}>★</span>)}
            </div>
            <p>Ratings help officials identify recurring service quality patterns by zone and date.</p>
          </article>

          <article className="resident-card resident-card--wide">
            <div className="resident-card-head"><span>Recent Complaints</span><strong>Reply inbox</strong></div>
            <div className="resident-complaint-list">
              {complaints.slice(0, 6).map((complaint) => (
                <div className="resident-complaint-item" key={complaint._id}>
                  <b>{complaintLabels[complaint.complaintType]}</b>
                  <span>{complaint.status}</span>
                  <p>{complaint.description}</p>
                  <section className={`resident-reply-box${complaint.resolutionNote?.trim() ? " resident-reply-box--answered" : ""}`} aria-label="Admin reply">
                    <small>{complaint.resolutionNote?.trim() ? "Admin reply" : "Reply inbox"}</small>
                    <strong>{complaintReplyMessage(complaint)}</strong>
                  </section>
                  <button type="button" onClick={() => deleteComplaint(complaint._id)}>Delete</button>
                </div>
              ))}
              {!complaints.length && <p className="muted">No complaints submitted yet.</p>}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
