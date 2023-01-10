

// 함수를 따로 만들어야 할지 고민이 있었는데 가속도 적용이나 후에 물리 법칙이 더 적용할 수도 
// 있을 것 같아서 일단 파일로 분리 했습니다. 
export function applyForce(distanceVector, subject)  { 
    subject.position.x += distanceVector.x;
    subject.position.y += distanceVector.y;
    subject.position.z += distanceVector.z;
}