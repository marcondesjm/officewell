-- Create table for ergonomic assessments
CREATE TABLE public.ergonomic_assessments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    monitor_altura BOOLEAN NOT NULL DEFAULT false,
    distancia_monitor BOOLEAN NOT NULL DEFAULT false,
    postura_punhos BOOLEAN NOT NULL DEFAULT false,
    encosto_cadeira BOOLEAN NOT NULL DEFAULT false,
    pes_apoiados BOOLEAN NOT NULL DEFAULT false,
    score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for LER risk assessments
CREATE TABLE public.ler_assessments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    dor_punhos BOOLEAN NOT NULL DEFAULT false,
    formigamento BOOLEAN NOT NULL DEFAULT false,
    rigidez BOOLEAN NOT NULL DEFAULT false,
    dor_pescoco BOOLEAN NOT NULL DEFAULT false,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('baixo', 'medio', 'alto')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for mental fatigue assessments
CREATE TABLE public.fatigue_assessments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    fatigue_level TEXT NOT NULL CHECK (fatigue_level IN ('boa', 'media', 'ruim')),
    suggestion TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ergonomic_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ler_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatigue_assessments ENABLE ROW LEVEL SECURITY;

-- Policies for ergonomic_assessments
CREATE POLICY "Anyone can view ergonomic assessments"
    ON public.ergonomic_assessments FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert ergonomic assessments"
    ON public.ergonomic_assessments FOR INSERT
    WITH CHECK (true);

-- Policies for ler_assessments
CREATE POLICY "Anyone can view LER assessments"
    ON public.ler_assessments FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert LER assessments"
    ON public.ler_assessments FOR INSERT
    WITH CHECK (true);

-- Policies for fatigue_assessments
CREATE POLICY "Anyone can view fatigue assessments"
    ON public.fatigue_assessments FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert fatigue assessments"
    ON public.fatigue_assessments FOR INSERT
    WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_ergonomic_assessments_created_at ON public.ergonomic_assessments(created_at DESC);
CREATE INDEX idx_ergonomic_assessments_session ON public.ergonomic_assessments(session_id);
CREATE INDEX idx_ler_assessments_created_at ON public.ler_assessments(created_at DESC);
CREATE INDEX idx_ler_assessments_session ON public.ler_assessments(session_id);
CREATE INDEX idx_fatigue_assessments_created_at ON public.fatigue_assessments(created_at DESC);
CREATE INDEX idx_fatigue_assessments_session ON public.fatigue_assessments(session_id);