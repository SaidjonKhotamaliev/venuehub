// ZU-TASK:

// Shunday function yozing, u parametridagi array ichida takrorlanmagan raqamlar yig'indisini qaytarsin.
// MASALAN: sumOfUnique([1,2,3,2]) return 4

function sumOfUnique(arr: number[]): number {
	let sum = 0;

	for (let i = 0; i < arr.length; i++) {
		if (arr.indexOf(arr[i]) === arr.lastIndexOf(arr[i])) {
			sum += arr[i];
		}
	}

	return sum;
}
console.log(sumOfUnique([1, 2, 3, 2, 5, 10, 5]));

// ******* EXTRA TASK of coding Championship

// function swapString(str1: string, str2: string): boolean {
// 	let result: boolean = false;
// 	let count: number = 0;

// 	if (str1.length !== str2.length) return result;

// 	for (let i = 0; i < str1.length; i++) {
// 		for (let j = 0; j < str2.length; j++) {
// 			if (str1[i] === str2[j]) count++;
// 		}
// 	}

// 	if (count === str1.length) result = true;
// 	return result;
// }

// console.log('result: ', swapString('bank', 'anbk'));
