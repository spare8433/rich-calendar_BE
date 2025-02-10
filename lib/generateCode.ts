export default function generateCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 대문자 + 숫자
  let result = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length); // 랜덤 인덱스 생성
    result += characters[randomIndex]; // 랜덤 문자 추가
  }

  return result;
}
