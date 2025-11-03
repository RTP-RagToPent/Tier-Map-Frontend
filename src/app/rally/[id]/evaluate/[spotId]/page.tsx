import { EvaluationForm } from '@features/evaluation/components/EvaluationForm';

// モックスポットデータ
// TODO: 実際のAPIからスポットデータを取得
const mockSpot = {
  id: 'spot-3',
  name: 'ラーメンC',
  address: '渋谷区 3-3-3',
  rating: 4.7,
};

export default function EvaluateSpotPage() {
  return <EvaluationForm spot={mockSpot} />;
}
