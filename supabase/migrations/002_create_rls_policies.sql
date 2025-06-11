-- RLS Policies for session isolation

-- Documents table policies
CREATE POLICY "Users can view their session documents"
  ON documents FOR SELECT
  USING (session_id = current_setting('app.current_session_id', true)::UUID);

CREATE POLICY "Users can insert documents in their session"
  ON documents FOR INSERT
  WITH CHECK (session_id = current_setting('app.current_session_id', true)::UUID);

CREATE POLICY "Users can update their session documents"
  ON documents FOR UPDATE
  USING (session_id = current_setting('app.current_session_id', true)::UUID);

CREATE POLICY "Users can delete their session documents"
  ON documents FOR DELETE
  USING (session_id = current_setting('app.current_session_id', true)::UUID);

-- Document chunks table policies
CREATE POLICY "Users can view their session chunks"
  ON document_chunks FOR SELECT
  USING (session_id = current_setting('app.current_session_id', true)::UUID);

CREATE POLICY "Users can insert chunks in their session"
  ON document_chunks FOR INSERT
  WITH CHECK (session_id = current_setting('app.current_session_id', true)::UUID);

CREATE POLICY "Users can delete their session chunks"
  ON document_chunks FOR DELETE
  USING (session_id = current_setting('app.current_session_id', true)::UUID);

-- Chat messages table policies
CREATE POLICY "Users can view their session messages"
  ON chat_messages FOR SELECT
  USING (session_id = current_setting('app.current_session_id', true)::UUID);

CREATE POLICY "Users can insert messages in their session"
  ON chat_messages FOR INSERT
  WITH CHECK (session_id = current_setting('app.current_session_id', true)::UUID);

-- Sessions table policies
CREATE POLICY "Users can view their own session"
  ON sessions FOR SELECT
  USING (id = current_setting('app.current_session_id', true)::UUID);

CREATE POLICY "Anyone can create a session"
  ON sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their session activity"
  ON sessions FOR UPDATE
  USING (id = current_setting('app.current_session_id', true)::UUID);

-- Service role bypass policies (for cleanup operations)
CREATE POLICY "Service role can manage all documents"
  ON documents FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage all chunks"
  ON document_chunks FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage all messages"
  ON chat_messages FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage all sessions"
  ON sessions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');