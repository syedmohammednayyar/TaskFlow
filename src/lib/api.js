import { NextResponse } from "next/server";

export function ok(data, init = {}) {
  return NextResponse.json({ success: true, data }, { status: 200, ...init });
}

export function created(data) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function badRequest(message, errors) {
  return NextResponse.json(
    { success: false, message, errors },
    { status: 400 }
  );
}

export function unauthorized(message = "You must be signed in") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forbidden(message = "You don't have permission to do that") {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ success: false, message }, { status: 404 });
}

export function serverError(message = "Something went wrong") {
  return NextResponse.json({ success: false, message }, { status: 500 });
}
