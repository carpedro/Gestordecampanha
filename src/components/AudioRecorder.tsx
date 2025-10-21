import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Check, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string, audioUrl: string) => void;
  maxDuration?: number; // in seconds
}

export function AudioRecorder({ onTranscriptionComplete, maxDuration = 300 }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Simulate transcription (in real app, this would call an API)
        setIsProcessing(true);
        await simulateTranscription(audioUrl);
        setIsProcessing(false);
        setHasRecorded(true);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
            toast.info(`Tempo máximo de ${maxDuration / 60} minutos atingido`);
          }
          return newTime;
        });
      }, 1000);

      toast.success('Gravação iniciada');
    } catch (error) {
      toast.error('Erro ao acessar o microfone. Verifique as permissões.');
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const simulateTranscription = async (audioUrl: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock transcription based on recording time
    const mockTexts = [
      'Esta é uma campanha focada em oferecer descontos especiais para novos alunos interessados em cursos de pós-graduação. A iniciativa visa atrair profissionais que buscam especialização em suas áreas de atuação, oferecendo condições diferenciadas de pagamento e benefícios exclusivos para matrículas realizadas durante o período da campanha.',
      'Campanha direcionada para captação de alunos de graduação com foco em cursos tecnológicos. Oferecemos bolsas parciais e facilidades no processo seletivo para candidatos que demonstrarem interesse durante este período promocional.',
      'Iniciativa voltada para renovação de matrículas com condições especiais. Alunos que renovarem suas matrículas durante a vigência desta campanha terão descontos progressivos e acesso antecipado a novos cursos e materiais didáticos.'
    ];
    
    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    onTranscriptionComplete(randomText, audioUrl);
    toast.success('Transcrição concluída! Revise e edite se necessário.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setHasRecorded(false);
    setRecordingTime(0);
  };

  if (hasRecorded) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Check className="w-5 h-5 text-green-600" />
        <span className="text-green-700">Áudio gravado e transcrito</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={resetRecording}
          className="ml-auto"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Regravar
        </Button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-blue-700">Transcrevendo áudio...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={stopRecording}
            className="gap-2"
          >
            <Square className="w-4 h-4" />
            Parar ({formatTime(recordingTime)})
          </Button>
          <span className="text-sm text-red-600 animate-pulse">● Gravando...</span>
        </>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startRecording}
          className="gap-2"
        >
          <Mic className="w-4 h-4" />
          Gravar descrição por áudio
        </Button>
      )}
    </div>
  );
}
