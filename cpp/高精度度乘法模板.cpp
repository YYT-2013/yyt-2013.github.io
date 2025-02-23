#include<cstring>
#include<iostream>
using namespace std;
int a[200],b,c[4000];
int main(){
	string s1;
	cin >> s1 >> b;
	int k = 0;
	for (int i = s1.size()-1;i >= 0;i --)a[k ++] = s1[i] - '0';
	
	for (int i = 0;i < s1.size();i ++)c[i] = a[i] * b;
	for (int i = 0;i < 200;i ++){
		if (c[i] >= 10){
			c[i + 1] += c[i] / 10;
			c[i] %= 10;
		}
	}
	int f  = 0;
	for (int i = 400;i > 0;i --){
		if (c[i] != 0)f = 1;
		if (f)cout << c[i];
	}
	cout << c[0];
	return 0;
}

