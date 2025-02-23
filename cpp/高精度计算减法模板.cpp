#include<cstring>
#include<iostream>
using namespace std;
int a[200],b[200],c[201];
string s1,s2;
int k = 0;
int main(){
	
	cin >> s1 >> s2;
	
	for (int i = s1.size()-1;i >= 0;i --)a[k ++] = s1[i] - '0';
	k = 0;
	for (int i = s2.size()-1;i >= 0;i --)b[k ++] = s2[i] - '0';
	int len = max(s1.size(),s2.size());
	for (int i = 0;i < len;i ++)c[i] = a[i] - b[i];
	for (int i = 0;i < 200;i ++){
		if (c[i] < 0){
			c[i + 1] -= 1;
			c[i] = 10 - c[i]* -1;
		}
	}
	int f  = 0;
	for (int i = 200;i > 0;i --){
		if (c[i] != 0)f = 1;
		if (f)cout << c[i];
	}
	cout << c[0];
	return 0;
}

