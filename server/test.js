const jwt = require("jsonwebtoken");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YmIyYzg1NWZiZjAwMDEzNjEwYzcyOCIsImVtYWlsIjoiYWRtaW4xMjNAYWRtaW4uY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQwNzc2MTYyLCJleHAiOjE3NDA3Nzk3NjJ9.rPeT5z55uvYSK9v4i7W1sKJm_d39g_NiRQNI5fjt05g";
const decoded = jwt.decode(token);
console.log(decoded);
