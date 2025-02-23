#include<bits/stdc++.h>
using namespace std;
int a[1000];
int n,k;
int bSearch(int l,int r){
	if (l > r)return -1;
	int mid = (l + r) / 2;
	if (a[mid] < k)return bSearch(mid + 1,r);
	if (a[mid] > k)return bSearch(l,mid - 1);
    if (a[mid] == k)return mid;
}
int main(){
	cin >> n >> k;
	for (int i = 0;i < n;i ++)cin >> a[i];
	cout <<bSearch(0,n-1)+1;
	return 0;
}
