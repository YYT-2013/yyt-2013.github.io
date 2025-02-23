# include <bits/stdc++.h>
using namespace std;
int f[100];
int fib(int n){
	if (n == 1 or n == 2)return 1;
	if (f[n] )return f[n];
	else return f[n] = fib(n - 1) + fib(n - 2);
}
int main () {
	int n;
	cin >> n;
	cout << fib(n);
	return 0;
}
	
