--  CALL REQUESTS
INSERT INTO call_requests (
  user_id,
  phone_number,
  goal,
  status,
  outcome_summary,
  created_at,
  updated_at,
  completed_at
)
VALUES
(
  1,
  '123-456-7890',
  'Book a dentist appointment for tomorrow.',
  'completed',
  'A phone conversation script for booking a dentist appointment was generated successfully.',
  NOW(),
  NOW(),
  NOW()
),
(
  1,
  '987-654-3210',
  'Remind the customer to take blood pressure medication.',
  'completed',
  'A medication reminder conversation was generated successfully.',
  NOW(),
  NOW(),
  NOW()
);


--  CALL TRANSCRIPTS
--  call_request_id = 3 (dentist appointment) 
INSERT INTO call_transcripts (call_request_id, speaker, message)
VALUES
(3, 'agent', 'Hello, this is Beepo calling to help schedule a dentist appointment for tomorrow.'),
(3, 'customer', 'Yes, I would like to book one.'),
(3, 'agent', 'Great! What time works best for you?'),
(3, 'customer', 'Morning would be perfect.'),
(3, 'agent', 'Your appointment has been scheduled for tomorrow morning. Thank you!');
--  call_request_id = 4 (medication reminder) 
INSERT INTO call_transcripts (call_request_id, speaker, message)
VALUES
(4, 'agent', 'Hello, this is Beepo calling with a reminder to take your blood pressure medication.'),
(4, 'customer', 'Oh, thank you for reminding me.'),
(4, 'agent', 'You are welcome. Please remember to take it regularly.'),
(4, 'customer', 'I will. Thanks again!'),
(4, 'agent', 'Have a great day!');


-- API USAGE LOGS
INSERT INTO api_usage_logs (
  user_id,
  endpoint,
  http_method,
  status_code
)
VALUES
(1, '/auth/register', 'POST', 201),
(1, '/auth/login', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 200),
(1, '/ai/test', 'POST', 500);