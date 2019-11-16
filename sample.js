const YJPromise = require("./src/YJPromise");

const testPromise = (customPromise = Promise) => {
  let result = new customPromise(
    (resolve, reject) => {
      setTimeout(
        (v) => resolve('잘 실행되었어요'),
        1000,
      );
    },
  );

  result
    .catch()
    .catch((e) => console.log(e))
    .then((v) => {
      console.log(v);
      return new customPromise(
        (resolve, reject) => {
          setTimeout(
            (v) => reject('에러다 에러야'),
            1000,
          );
        },
      );
    })
    .catch(
      (e) => console.log('에러핸들러1 :', e),
    )
    .catch((e) => console.log('에러핸들러2 : ', e));

  result = new customPromise(
    (resolve, reject) => {
      resolve('잘 처리되었어요');
    },
  )
    .then()
    .then(
      (v) => {
        console.log(v);
        return 3; // 프로미스 외의 값을 반환
      },
    )
    .then()
    .then(
      (v) => console.log(v),
    )
    .catch(
      (v) => {
        console.log('에러 핸들러', v);
      },
    );


  new customPromise(((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    }, 2000);
  }))
    .then((result) => {
      console.log(result); // 1
      return result + 10;
    })
    .then((result) => {
      console.log(result); // 11
      return result + 20;
    })
    .then((result) => {
      console.log(result); // 31
    });
};

testPromise(YJPromise);
testPromise(Promise);
